/**
 * oauth-server 캘린더 브로커를 호출하는 서버사이드 클라이언트.
 * 브로커 시크릿과 사용자 JWT 는 여기(서버)에서만 다루고 클라이언트에 노출하지 않는다.
 */
import { OAUTH_SERVER_INTERNAL_URL } from './oauth';
import type { CalendarEventDTO } from './flightParser';
import type { FlightEventInput } from './flightEvent';

export const FLIGHT_CALENDAR_NAME = 'MyFlightHistory';

/** 브로커가 4xx/5xx 로 응답했을 때 코드/상태를 담아 던진다. */
export class BrokerError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(`broker ${status} ${code}`);
  }
}

function brokerSecret(): string {
  const s = process.env.CALENDAR_BROKER_SECRET;
  if (!s) throw new Error('CALENDAR_BROKER_SECRET 미설정');
  return s;
}

async function brokerFetch(
  path: string,
  token: string,
  init: { method?: string; body?: unknown } = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    'x-internal-secret': brokerSecret(),
    Authorization: `Bearer ${token}`,
  };
  if (init.body !== undefined) headers['Content-Type'] = 'application/json';

  return fetch(`${OAUTH_SERVER_INTERNAL_URL}/api/google/calendar${path}`, {
    method: init.method ?? 'GET',
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
  });
}

async function toError(res: Response): Promise<BrokerError> {
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  return new BrokerError(res.status, data.error ?? 'unknown');
}

/** 전용 "MyFlightHistory" 캘린더 id 를 찾고, 없으면 생성한다. */
export async function findOrCreateFlightCalendar(token: string): Promise<string> {
  const listRes = await brokerFetch('/calendars', token);
  if (!listRes.ok) throw await toError(listRes);

  const { calendars } = (await listRes.json()) as {
    calendars: Array<{ id: string; summary: string }>;
  };
  const found = calendars.find((c) => c.summary === FLIGHT_CALENDAR_NAME);
  if (found) return found.id;

  const createRes = await brokerFetch('/calendars', token, {
    method: 'POST',
    body: { summary: FLIGHT_CALENDAR_NAME },
  });
  if (!createRes.ok) throw await toError(createRes);
  const created = (await createRes.json()) as { id: string };
  return created.id;
}

/** 지정 캘린더(기본 primary)의 이벤트를 조회한다. */
export async function fetchCalendarEvents(
  token: string,
  opts: { calendarId?: string; timeMin: string; timeMax: string },
): Promise<CalendarEventDTO[]> {
  const params = new URLSearchParams({ timeMin: opts.timeMin, timeMax: opts.timeMax });
  if (opts.calendarId) params.set('calendarId', opts.calendarId);

  const res = await brokerFetch(`/events?${params.toString()}`, token);
  if (!res.ok) throw await toError(res);
  const data = (await res.json()) as { events?: CalendarEventDTO[] };
  return data.events ?? [];
}

/** 전용 캘린더에 항공편 이벤트를 생성한다. */
export async function createFlightEvent(
  token: string,
  calendarId: string,
  event: FlightEventInput,
): Promise<{ id: string }> {
  const res = await brokerFetch('/events', token, {
    method: 'POST',
    body: { calendarId, event },
  });
  if (!res.ok) throw await toError(res);
  return (await res.json()) as { id: string };
}

/** 전용 캘린더의 항공편 이벤트를 삭제한다. */
export async function removeFlightEvent(
  token: string,
  calendarId: string,
  eventId: string,
): Promise<void> {
  const params = new URLSearchParams({ calendarId, eventId });
  const res = await brokerFetch(`/events?${params.toString()}`, token, {
    method: 'DELETE',
  });
  if (!res.ok) throw await toError(res);
}
