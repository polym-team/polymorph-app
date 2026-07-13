/**
 * airportal.go.kr 기반 실시간 운항 상태 (국내선 담당, 비공식 엔드포인트).
 *
 * 공식 API가 아니라 웹 XHR 을 서버사이드에서 호출한다 — 사이트 구조가 바뀌면 깨질 수 있어
 * best-effort 로만 쓰고, 실패 시 null 을 돌려 호출부에서 휴리스틱으로 fallback 한다.
 */
import {
  airportalItemToStatus,
  matchAirportalFlight,
  type AirportalItem,
  type LiveStatus,
} from './liveStatus';

const ENDPOINT = 'https://www.airportal.go.kr/airport/getFlightArrivalDepartureInfo.do';
const PAGE = 'https://www.airportal.go.kr/airport/aircraftInfo.do';
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36';

/**
 * 세션 쿠키 부트스트랩: 페이지를 먼저 GET 해서 JSESSIONID 등을 받아온다.
 * WAF 가 세션 없는 요청을 차단하므로 POST 전에 필요. 배치당 한 번만 호출해 재사용.
 */
export async function getAirportalSession(): Promise<string | null> {
  try {
    const res = await fetch(PAGE, { headers: { 'User-Agent': UA }, cache: 'no-store' });
    const setCookies =
      typeof res.headers.getSetCookie === 'function'
        ? res.headers.getSetCookie()
        : [res.headers.get('set-cookie') ?? ''];
    const jar = setCookies
      .filter(Boolean)
      .map((c) => c.split(';')[0])
      .join('; ');
    return jar || null;
  } catch {
    return null;
  }
}

/** 한글 공항/도시명 → ICAO (airportal depAirport/arrAirport 코드). */
const NAME_TO_ICAO: Record<string, string> = {
  김포: 'RKSS',
  서울: 'RKSS',
  제주: 'RKPC',
  김해: 'RKPK',
  부산: 'RKPK',
  대구: 'RKTN',
  청주: 'RKTU',
  광주: 'RKJJ',
  여수: 'RKJY',
  울산: 'RKPU',
  사천: 'RKPS',
  원주: 'RKNW',
  양양: 'RKNY',
  포항: 'RKTH',
  군산: 'RKJK',
  무안: 'RKJB',
  인천: 'RKSI',
};

function toIcao(name: string | null): string | null {
  if (!name) return null;
  const n = name.trim();
  for (const [k, v] of Object.entries(NAME_TO_ICAO)) {
    if (n.includes(k)) return v;
  }
  return null;
}

/** ISO 출발시각 → 그 시각 ±90분의 HHMM 창. */
function timeWindow(departure: string): { startTime: string; endTime: string } {
  const m = departure.match(/T(\d{2}):(\d{2})/);
  const base = m ? +m[1] * 60 + +m[2] : 12 * 60;
  const clamp = (v: number) => Math.max(0, Math.min(24 * 60 - 1, v));
  const fmt = (mins: number) =>
    `${String(Math.floor(mins / 60)).padStart(2, '0')}${String(mins % 60).padStart(2, '0')}`;
  return { startTime: fmt(clamp(base - 90)), endTime: fmt(clamp(base + 90)) };
}

/**
 * 국내선 실시간 상태. 출발지 ICAO 를 알면 출발보드, 없으면 도착지 ICAO 로 도착보드 조회.
 * 어느 공항도 특정 못하면 null.
 */
export async function fetchAirportalStatus(
  flight: {
    flightNumber: string;
    from: string | null;
    to: string | null;
    departure: string;
  },
  cookie: string | null,
): Promise<LiveStatus | null> {
  if (!cookie) return null; // 세션 없으면 WAF 차단되므로 시도하지 않음
  const fromIcao = toIcao(flight.from);
  const toIcao_ = toIcao(flight.to);
  const ymd = flight.departure.slice(0, 10).replace(/-/g, '');
  const { startTime, endTime } = timeWindow(flight.departure);

  let body: Record<string, string>;
  if (fromIcao) {
    body = { searchContext: 'departure', ymd, startTime, endTime, loadType: '', depAirport: fromIcao };
  } else if (toIcao_) {
    body = { searchContext: 'arrival', ymd, startTime, endTime, loadType: '', arrAirport: toIcao_ };
  } else {
    return null;
  }

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        Referer: PAGE,
        Origin: 'https://www.airportal.go.kr',
        'User-Agent': UA,
        Cookie: cookie,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;

  const data = await res.json().catch(() => null);
  const items: AirportalItem[] = Array.isArray(data?.content) ? data.content : [];
  const match = matchAirportalFlight(items, flight.flightNumber);
  return match ? airportalItemToStatus(match) : null;
}
