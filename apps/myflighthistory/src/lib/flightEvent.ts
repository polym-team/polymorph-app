/**
 * 우리 정규 항공편 이벤트 포맷.
 *
 * 수동 등록한 항공편은 전용 "MyFlightHistory" 캘린더에 이벤트로 써넣되,
 * 구조화 데이터를 extendedProperties.private[MYFH_KEY] 에 JSON 으로 심는다.
 * 되읽을 때 이 값이 있으면 휴리스틱 파싱 없이 무손실로 복원한다.
 */

export const MYFH_KEY = 'myfh';
const MYFH_VERSION = 1;

export interface FlightData {
  flightNumber: string;
  from: string | null;
  to: string | null;
  /** ISO 8601 (타임존 포함) */
  departure: string;
  arrival: string | null;
}

/** 구글 캘린더 이벤트 생성 바디(브로커 POST 로 전달). */
export interface FlightEventInput {
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  extendedProperties: { private: Record<string, string> };
}

const DEFAULT_TZ = 'Asia/Seoul';
const SEOUL_OFFSET = '+09:00';

/**
 * datetime-local 입력("2026-07-20T19:00")을 RFC3339 로 정규화한다.
 * 초가 없으면 붙이고, 오프셋/Z 가 없으면 Asia/Seoul(+09:00)로 간주.
 */
export function toRfc3339(local: string): string {
  let s = local.trim();
  if (/T\d\d:\d\d$/.test(s)) s += ':00';
  if (!/(?:[+-]\d\d:\d\d|Z)$/.test(s)) s += SEOUL_OFFSET;
  return s;
}

/** 편명 정규화: 대문자 + 공백 제거 (OZ 8995 → OZ8995). */
export function normalizeFlightNumber(fn: string): string {
  return fn.toUpperCase().replace(/\s+/g, '');
}

/** FlightData → 캘린더 이벤트 생성 바디. 사람이 읽을 제목 + 기계용 payload 동시 탑재. */
export function buildFlightEventInput(data: FlightData): FlightEventInput {
  const flightNumber = normalizeFlightNumber(data.flightNumber);
  const departure = toRfc3339(data.departure);
  const arrival = data.arrival ? toRfc3339(data.arrival) : null;

  const route = [data.from, data.to].filter(Boolean).join(' → ');
  const summary = route ? `${flightNumber} (${route})` : flightNumber;

  const normalized: FlightData = { ...data, flightNumber, departure, arrival };

  return {
    summary,
    description: 'MyFlightHistory 에서 등록한 항공편입니다.',
    start: { dateTime: departure, timeZone: DEFAULT_TZ },
    end: { dateTime: arrival ?? departure, timeZone: DEFAULT_TZ },
    extendedProperties: {
      private: {
        [MYFH_KEY]: JSON.stringify({ v: MYFH_VERSION, ...normalized }),
      },
    },
  };
}

/** 이벤트의 extendedProperties 에서 우리 payload 를 복원. 없거나 깨졌으면 null. */
export function readFlightData(
  ev: { extendedProperties?: { private?: Record<string, string> } },
): FlightData | null {
  const raw = ev.extendedProperties?.private?.[MYFH_KEY];
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<FlightData> & { v?: number };
    if (!parsed.flightNumber || !parsed.departure) return null;
    return {
      flightNumber: parsed.flightNumber,
      from: parsed.from ?? null,
      to: parsed.to ?? null,
      departure: parsed.departure,
      arrival: parsed.arrival ?? null,
    };
  } catch {
    return null;
  }
}
