import { NextResponse, type NextRequest } from 'next/server';
import { validateToken } from './jwt';

const TOKEN_COOKIE_NAME = 'polymorph_auth';
const SILENT_ATTEMPTED_COOKIE = 'polymorph_silent_auth_tried';

export interface MiddlewareOptions {
  /** 인증 실패 시 동작
   *  - 'redirect': oauth-server 로그인 페이지로 리다이렉트 (강제 로그인)
   *  - 'silent': oauth-server에 silent SSO 시도 (세션 있으면 자동 로그인, 없으면 비로그인 진행)
   *  - 'continue' (기본): 비로그인 상태로 진행 (헤더 주입 안 함)
   */
  onUnauthenticated?: 'redirect' | 'silent' | 'continue';
  /** 클라이언트 앱 ID (oauth-server에 등록된 ID) */
  clientId: string;
  /** oauth-server URL (기본: https://oauth.polymorph.co.kr) */
  oauthServerUrl?: string;
}

const SILENT_TTL_SEC = 60;

/**
 * 인증 미들웨어 헬퍼
 * - 쿠키에서 토큰을 추출하고 검증, 통과 시 x-user-* 헤더 추가
 * - silent 모드: oauth-server에 SSO 세션 있는지 확인 후 자동 로그인 (사용자 클릭 없이)
 */
export async function authMiddleware(
  req: NextRequest,
  options: MiddlewareOptions,
): Promise<NextResponse> {
  const token = req.cookies.get(TOKEN_COOKIE_NAME)?.value;

  if (token) {
    const result = await validateToken(token);
    if (result.valid && result.payload) {
      // 검증 성공 - 헤더에 유저 정보 주입
      const headers = new Headers(req.headers);
      headers.set('x-user-id', result.payload.sub);
      headers.set('x-user-email', result.payload.email);
      if (result.payload.name) {
        headers.set('x-user-name', encodeURIComponent(result.payload.name));
      }
      headers.set('x-user-provider', result.payload.provider);
      return NextResponse.next({ request: { headers } });
    }
  }

  return handleUnauthorized(req, options);
}

function handleUnauthorized(req: NextRequest, options: MiddlewareOptions): NextResponse {
  const mode = options.onUnauthenticated ?? 'continue';
  const oauthUrl = options.oauthServerUrl ?? 'https://oauth.polymorph.co.kr';

  if (mode === 'redirect') {
    const redirectUri = `${req.nextUrl.origin}/auth/callback?returnTo=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
    const loginUrl = `${oauthUrl}/login?clientId=${options.clientId}&redirectUri=${encodeURIComponent(redirectUri)}`;
    return NextResponse.redirect(loginUrl);
  }

  if (mode === 'silent') {
    // 무한 루프 방지: 직전에 silent auth 시도했으면 스킵
    const tried = req.cookies.get(SILENT_ATTEMPTED_COOKIE)?.value;
    if (tried) {
      return NextResponse.next();
    }

    const redirectUri = `${req.nextUrl.origin}/auth/callback?returnTo=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
    const silentUrl = `${oauthUrl}/api/silent-auth?clientId=${options.clientId}&redirectUri=${encodeURIComponent(redirectUri)}`;

    const res = NextResponse.redirect(silentUrl);
    res.cookies.set(SILENT_ATTEMPTED_COOKIE, '1', {
      maxAge: SILENT_TTL_SEC,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });
    return res;
  }

  // 'continue' (기본)
  return NextResponse.next();
}

export const TOKEN_COOKIE = TOKEN_COOKIE_NAME;
