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

// IATA 편명: 항공사 2자(영문/숫자 혼합 가능) + 1~4자리 숫자. 예: OZ102, KE81, 7C1234
const FLIGHT_NUMBER_RE = /\b([A-Z]{2}|[A-Z]\d|\d[A-Z])\s?(\d{1,4})\b/;
const FLIGHT_KEYWORDS = /(flight|항공|비행편|✈)/i;
// "A to B", "A → B", "A - B" 형태의 노선 추출
const ROUTE_RE = /([A-Za-z가-힣.\s]{2,30}?)\s*(?:→|->|-|to|~)\s*([A-Za-z가-힣.\s]{2,30})/;

/** 이벤트가 항공편으로 보이는지 판정. */
export function looksLikeFlight(ev: CalendarEventDTO): boolean {
  const summary = ev.summary ?? '';
  const haystack = `${summary} ${ev.description ?? ''}`;
  return FLIGHT_KEYWORDS.test(haystack) || FLIGHT_NUMBER_RE.test(summary);
}

function extractRoute(text: string): { from: string | null; to: string | null } {
  const m = text.match(ROUTE_RE);
  if (!m) return { from: null, to: null };
  const clean = (s: string) => s.trim().replace(/\s+/g, ' ') || null;
  return { from: clean(m[1]), to: clean(m[2]) };
}

/** 단일 이벤트를 ParsedFlight 로 변환. */
export function parseFlight(ev: CalendarEventDTO): ParsedFlight {
  const summary = ev.summary ?? '';
  const numMatch = summary.match(FLIGHT_NUMBER_RE) ?? ev.description?.match(FLIGHT_NUMBER_RE);
  const flightNumber = numMatch ? `${numMatch[1]}${numMatch[2]}`.toUpperCase() : null;

  // 노선: 제목에서 우선, 없으면 location
  const route = extractRoute(summary);
  if (!route.to && ev.location) {
    const locRoute = extractRoute(ev.location);
    if (locRoute.to) {
      route.from = locRoute.from;
      route.to = locRoute.to;
    }
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

/** 이벤트 목록에서 항공편만 골라 파싱하고 출발시각 순으로 정렬. */
export function extractFlights(events: CalendarEventDTO[]): ParsedFlight[] {
  return events
    .filter(looksLikeFlight)
    .map(parseFlight)
    .sort((a, b) => (a.departure ?? '').localeCompare(b.departure ?? ''));
}
