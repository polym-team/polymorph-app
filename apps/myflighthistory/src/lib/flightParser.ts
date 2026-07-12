/**
 * 구글 캘린더 이벤트에서 항공편을 추출하는 휴리스틱 파서.
 *
 * 구글이 Gmail 예약메일로 자동 생성한 이벤트는 편명/공항이 구조화 필드가 아니라
 * 제목·설명·위치 텍스트에 묻혀 있는 경우가 많다. 따라서 완벽 파싱은 불가능하며,
 * confidence 로 신뢰도를 표기하고 저신뢰 건은 사용자 수동 보정을 유도한다.
 */

export interface CalendarEventDTO {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: { dateTime?: string; date?: string; timeZone?: string };
  end?: { dateTime?: string; date?: string; timeZone?: string };
  htmlLink?: string;
}

export interface ParsedFlight {
  id: string;
  title: string;
  flightNumber: string | null;
  from: string | null;
  to: string | null;
  /** ISO 문자열 (또는 종일 이벤트의 날짜) */
  departure: string | null;
  arrival: string | null;
  confidence: 'high' | 'low';
  htmlLink?: string;
}

// IATA 편명: 항공사 2자(영문/숫자 혼합) + 1~4자리 숫자. 예: OZ8995, KE81, 7C1234
// 뒤에 한글이 붙으면(예: "OZ 15기", "FE2팀") 편명이 아닌 카운터로 보고 제외.
const FLIGHT_NUMBER_RE = /\b([A-Z]{2}|[A-Z]\d|\d[A-Z])\s?(\d{1,4})\b(?![가-힣])/;
const FLIGHT_KEYWORDS = /(flight|항공|비행)/i;
// 출발↔도착 구분자
const ROUTE_SEPARATORS = ['→', '->', '–>', '✈', '~'];
const PLACE_JUNK = /(flight|비행기|비행편|비행|항공편|탑승|항공|행)/gi;

/** 편명 문자열 추출 (정규화된 대문자, 공백 제거). */
function extractFlightNumber(text: string): string | null {
  const m = text.match(FLIGHT_NUMBER_RE);
  return m ? `${m[1]}${m[2]}`.toUpperCase() : null;
}

/** 이벤트가 항공편으로 보이는지 판정. */
export function looksLikeFlight(ev: CalendarEventDTO): boolean {
  const summary = ev.summary ?? '';
  const haystack = `${summary} ${ev.description ?? ''}`;
  // 키워드가 있거나, (카운터가 아닌) 진짜 편명이 제목에 있으면 항공편으로 간주
  return FLIGHT_KEYWORDS.test(haystack) || FLIGHT_NUMBER_RE.test(summary);
}

/** 장소 토큰 정리: 괄호코드·편명·항공사/키워드·구두점 제거. */
function cleanPlace(raw: string, flightNumber: string | null): string | null {
  let t = raw.replace(/\([^)]*\)/g, ' '); // (ICN) 등 괄호 그룹 제거
  if (flightNumber) {
    const m = flightNumber.match(/^([A-Z0-9]+?)(\d+)$/);
    if (m) t = t.replace(new RegExp(`${m[1]}\\s?${m[2]}`, 'ig'), ' '); // "YP 732" 잔여 제거
  }
  t = t.replace(PLACE_JUNK, ' ');
  t = t.replace(/[()✈:.,~><→\/–—-]/g, ' ');
  t = t.replace(/\s+/g, ' ').trim();
  return t.length ? t : null;
}

/**
 * 노선 추출에 쓸 텍스트를 고른다. "아시아나항공 OZ8936 (제주 ✈ 김포)" 처럼 괄호 안에
 * 구분자가 있으면 괄호 내용만 사용해 항공사명 누출을 막는다. 없으면 전체 텍스트.
 */
function pickRouteText(text: string): string {
  const parens = text.match(/\(([^)]*)\)/g) ?? [];
  for (const p of parens) {
    const inner = p.slice(1, -1);
    if (ROUTE_SEPARATORS.some((s) => inner.includes(s)) || /\sto\s/i.test(inner)) {
      return inner;
    }
  }
  return text;
}

/** 제목/위치에서 출발·도착을 추출. */
function extractRoute(
  rawText: string,
  flightNumber: string | null,
): { from: string | null; to: string | null } {
  const text = pickRouteText(rawText);
  let left: string | null = null;
  let right: string | null = null;

  for (const sep of ROUTE_SEPARATORS) {
    const i = text.indexOf(sep);
    if (i >= 0) {
      left = text.slice(0, i);
      right = text.slice(i + sep.length);
      break;
    }
  }
  if (left === null) {
    const m = text.match(/^(.*?)\s+to\s+(.*)$/i); // "A to B"
    if (m) {
      left = m[1];
      right = m[2];
    }
  }
  if (left === null || right === null) return { from: null, to: null };

  return {
    from: cleanPlace(left, flightNumber),
    to: cleanPlace(right, flightNumber),
  };
}

/** 단일 이벤트를 ParsedFlight 로 변환. */
export function parseFlight(ev: CalendarEventDTO): ParsedFlight {
  const summary = ev.summary ?? '';
  const flightNumber = extractFlightNumber(summary) ?? extractFlightNumber(ev.description ?? '');

  let route = extractRoute(summary, flightNumber);
  if (!route.to && ev.location) {
    const locRoute = extractRoute(ev.location, flightNumber);
    if (locRoute.to) route = locRoute;
  }

  return {
    id: ev.id,
    title: summary || '(제목 없음)',
    flightNumber,
    from: route.from,
    to: route.to,
    departure: ev.start?.dateTime ?? ev.start?.date ?? null,
    arrival: ev.end?.dateTime ?? ev.end?.date ?? null,
    confidence: flightNumber ? 'high' : 'low',
    htmlLink: ev.htmlLink,
  };
}

/** 같은 편명+출발시각의 중복 이벤트를 병합(노선 정보가 더 많은 쪽을 유지). */
function dedupe(flights: ParsedFlight[]): ParsedFlight[] {
  const byKey = new Map<string, ParsedFlight>();
  for (const f of flights) {
    const key =
      f.flightNumber && f.departure
        ? `${f.flightNumber}|${f.departure.slice(0, 16)}`
        : `id:${f.id}`;
    const prev = byKey.get(key);
    if (!prev) {
      byKey.set(key, f);
    } else if (!prev.to && f.to) {
      byKey.set(key, f); // 노선이 있는 쪽으로 교체
    }
  }
  return [...byKey.values()];
}

/** 이벤트 목록에서 항공편만 골라 파싱·중복제거하고 출발시각 순 정렬. */
export function extractFlights(events: CalendarEventDTO[]): ParsedFlight[] {
  const parsed = events.filter(looksLikeFlight).map(parseFlight);
  return dedupe(parsed).sort((a, b) => (a.departure ?? '').localeCompare(b.departure ?? ''));
}
