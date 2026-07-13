/**
 * 구글 캘린더 연동용 OAuth2 헬퍼 (fetch 기반, 외부 SDK 무의존).
 *
 * 로그인(NextAuth GoogleProvider)과 분리된 incremental authorization 흐름 전용.
 * 로그인 자격증명(GOOGLE_CLIENT_ID/SECRET)을 재사용하되, 캘린더 scope + offline 접근을
 * 사용자가 명시적으로 "캘린더 연결"을 눌렀을 때만 요청한다.
 */

/**
 * 캘린더 scope (민감 scope).
 * 전용 "MyFlightHistory" 캘린더 *생성* + 이벤트 읽기/쓰기 + primary 읽기까지 커버하려면
 * 이벤트 전용(calendar.events)이 아니라 전체 calendar 권한이 필요하다(calendars.insert 때문).
 */
export const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar';

/** 연동 흐름 CSRF 방지용 state 쿠키 이름. */
export const STATE_COOKIE = 'gcal_oauth_state';

const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number; // 초
  refresh_token?: string; // 최초 동의 또는 prompt=consent 시에만 내려옴
  scope: string;
  token_type: string;
}

function getClientCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET 가 설정되지 않았습니다.');
  }
  return { clientId, clientSecret };
}

/**
 * 캘린더 연동 콜백 URI. Google Cloud Console 의 "승인된 리디렉션 URI" 에 등록되어 있어야 한다.
 * base 는 NEXTAUTH_URL(oauth-server 자기 자신) 을 사용.
 */
export function getCalendarRedirectUri(): string {
  const base = process.env.NEXTAUTH_URL;
  if (!base) throw new Error('NEXTAUTH_URL 이 설정되지 않았습니다.');
  return `${base.replace(/\/$/, '')}/api/connect/google-calendar/callback`;
}

/** 사용자를 보낼 구글 동의 화면 URL 을 만든다. */
export function buildCalendarAuthUrl(state: string): string {
  const { clientId } = getClientCredentials();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getCalendarRedirectUri(),
    response_type: 'code',
    scope: CALENDAR_SCOPE,
    access_type: 'offline', // refresh token 발급
    prompt: 'consent', // 재동의 시에도 refresh token 재발급 보장
    include_granted_scopes: 'true',
    state,
  });
  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

/** authorization code 를 access/refresh token 으로 교환한다. */
export async function exchangeCalendarCode(
  code: string,
): Promise<GoogleTokenResponse> {
  const { clientId, clientSecret } = getClientCredentials();
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getCalendarRedirectUri(),
      grant_type: 'authorization_code',
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`구글 토큰 교환 실패 (${res.status}): ${detail}`);
  }
  return res.json();
}

/** 구글에서 토큰(주로 refresh token)을 폐기한다. best-effort — 실패해도 throw 하지 않음. */
export async function revokeCalendarToken(token: string): Promise<boolean> {
  try {
    const res = await fetch('https://oauth2.googleapis.com/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

type EventDateTime = { dateTime?: string; date?: string; timeZone?: string };

/** 캘린더 이벤트 (앱 소비에 필요한 필드만 추린 형태). */
export interface CalendarEvent {
  id: string;
  status?: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: EventDateTime;
  end?: EventDateTime;
  htmlLink?: string;
  /** 앱이 심어둔 구조화 데이터(private) — 무손실 왕복용 */
  extendedProperties?: { private?: Record<string, string> };
}

/** 이벤트 생성/수정 입력. Google events API 바디의 최소 부분집합. */
export interface CalendarEventInput {
  summary: string;
  description?: string;
  location?: string;
  start: EventDateTime;
  end: EventDateTime;
  extendedProperties?: { private?: Record<string, string> };
}

interface CalendarEventsListResponse {
  items?: CalendarEvent[];
  nextPageToken?: string;
}

const CALENDAR_BASE = 'https://www.googleapis.com/calendar/v3';

function authHeaders(accessToken: string, json = false): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    ...(json ? { 'Content-Type': 'application/json' } : {}),
  };
}

/**
 * 지정 캘린더(기본 primary)의 이벤트를 조회한다. singleEvents=true 로 반복 일정을 전개하고
 * 시작시각 순 정렬. nextPageToken 을 따라 전 구간을 수집(시간창으로 이미 제한됨).
 */
export async function listCalendarEvents(
  accessToken: string,
  opts: {
    calendarId?: string;
    timeMin?: string;
    timeMax?: string;
    maxResultsPerPage?: number;
  } = {},
): Promise<CalendarEvent[]> {
  const calendarId = encodeURIComponent(opts.calendarId ?? 'primary');
  const endpoint = `${CALENDAR_BASE}/calendars/${calendarId}/events`;
  const events: CalendarEvent[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: String(opts.maxResultsPerPage ?? 250),
    });
    if (opts.timeMin) params.set('timeMin', opts.timeMin);
    if (opts.timeMax) params.set('timeMax', opts.timeMax);
    if (pageToken) params.set('pageToken', pageToken);

    const res = await fetch(`${endpoint}?${params.toString()}`, {
      headers: authHeaders(accessToken),
    });
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`구글 캘린더 events.list 실패 (${res.status}): ${detail}`);
    }

    const data: CalendarEventsListResponse = await res.json();
    for (const item of data.items ?? []) {
      events.push({
        id: item.id,
        status: item.status,
        summary: item.summary,
        description: item.description,
        location: item.location,
        start: item.start,
        end: item.end,
        htmlLink: item.htmlLink,
        extendedProperties: item.extendedProperties,
      });
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return events;
}

/** 사용자의 캘린더 목록을 조회한다. */
export async function listCalendars(
  accessToken: string,
): Promise<Array<{ id: string; summary: string; primary?: boolean }>> {
  const res = await fetch(`${CALENDAR_BASE}/users/me/calendarList?maxResults=250`, {
    headers: authHeaders(accessToken),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`구글 캘린더 calendarList 실패 (${res.status}): ${detail}`);
  }
  const data = (await res.json()) as {
    items?: Array<{ id: string; summary: string; primary?: boolean }>;
  };
  return (data.items ?? []).map((c) => ({
    id: c.id,
    summary: c.summary,
    primary: c.primary,
  }));
}

/** 새 보조 캘린더를 생성하고 그 id 를 반환한다. */
export async function createCalendar(
  accessToken: string,
  summary: string,
): Promise<{ id: string; summary: string }> {
  const res = await fetch(`${CALENDAR_BASE}/calendars`, {
    method: 'POST',
    headers: authHeaders(accessToken, true),
    body: JSON.stringify({ summary }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`구글 캘린더 calendars.insert 실패 (${res.status}): ${detail}`);
  }
  const data = (await res.json()) as { id: string; summary: string };
  return { id: data.id, summary: data.summary };
}

/** 지정 캘린더에 이벤트를 생성하고 그 id 를 반환한다. */
export async function insertCalendarEvent(
  accessToken: string,
  calendarId: string,
  event: CalendarEventInput,
): Promise<{ id: string; htmlLink?: string }> {
  const res = await fetch(
    `${CALENDAR_BASE}/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: authHeaders(accessToken, true),
      body: JSON.stringify(event),
    },
  );
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`구글 캘린더 events.insert 실패 (${res.status}): ${detail}`);
  }
  const data = (await res.json()) as { id: string; htmlLink?: string };
  return { id: data.id, htmlLink: data.htmlLink };
}

/** 지정 캘린더의 이벤트를 삭제한다. */
export async function deleteCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
): Promise<void> {
  const res = await fetch(
    `${CALENDAR_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    { method: 'DELETE', headers: authHeaders(accessToken) },
  );
  // 이미 삭제된 경우(410/404)는 성공으로 간주
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    const detail = await res.text();
    throw new Error(`구글 캘린더 events.delete 실패 (${res.status}): ${detail}`);
  }
}

/** refresh token 으로 새 access token 을 발급받는다. (A-3 브로커에서 재사용) */
export async function refreshCalendarAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; expiresAt: Date }> {
  const { clientId, clientSecret } = getClientCredentials();
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`구글 access token 갱신 실패 (${res.status}): ${detail}`);
  }
  const data: GoogleTokenResponse = await res.json();
  return {
    accessToken: data.access_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  };
}
