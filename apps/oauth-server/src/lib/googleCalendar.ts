/**
 * 구글 캘린더 연동용 OAuth2 헬퍼 (fetch 기반, 외부 SDK 무의존).
 *
 * 로그인(NextAuth GoogleProvider)과 분리된 incremental authorization 흐름 전용.
 * 로그인 자격증명(GOOGLE_CLIENT_ID/SECRET)을 재사용하되, 캘린더 scope + offline 접근을
 * 사용자가 명시적으로 "캘린더 연결"을 눌렀을 때만 요청한다.
 */

/** 읽기 전용 캘린더 이벤트 scope (민감 scope). */
export const CALENDAR_SCOPE =
  'https://www.googleapis.com/auth/calendar.events.readonly';

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
