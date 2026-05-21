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
 * 운영 외부 URL을 구한다.
 * - ingress 뒤에서는 `req.nextUrl.origin`이 컨테이너 내부 host(http://0.0.0.0:3000)로 잡힐 수 있다.
 * - 따라서 신뢰 가능한 ingress가 보내는 X-Forwarded-Host / X-Forwarded-Proto를 우선 사용한다.
 * - 일부 ingress는 HTTPS 종단 처리 후 내부로 forward할 때 X-Forwarded-Proto를 'http'로
 *   잘못 세팅한다. 운영 외부 host(non-local)면 항상 https로 가정한다.
 */
function getExternalOrigin(req: NextRequest): string {
  const forwardedHost = req.headers.get('x-forwarded-host');
  if (forwardedHost) {
    const forwardedProto = req.headers.get('x-forwarded-proto');
    const isLocal = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i.test(forwardedHost);
    const proto = isLocal ? (forwardedProto ?? 'http') : 'https';
    return `${proto}://${forwardedHost}`;
  }
  return req.nextUrl.origin;
}

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
      console.log(`[shared-auth:${options.clientId}] ${req.method} ${req.nextUrl.pathname} -> authed sub=${result.payload.sub}`);
      return NextResponse.next({ request: { headers } });
    }
    console.log(`[shared-auth:${options.clientId}] ${req.method} ${req.nextUrl.pathname} -> invalid token: ${result.error}`);
  }

  return handleUnauthorized(req, options);
}

function handleUnauthorized(req: NextRequest, options: MiddlewareOptions): NextResponse {
  const mode = options.onUnauthenticated ?? 'continue';
  const oauthUrl = options.oauthServerUrl ?? 'https://oauth.polymorph.co.kr';
  const externalOrigin = getExternalOrigin(req);

  if (mode === 'redirect') {
    const redirectUri = `${externalOrigin}/auth/callback?returnTo=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
    const loginUrl = `${oauthUrl}/login?clientId=${options.clientId}&redirectUri=${encodeURIComponent(redirectUri)}`;
    console.log(`[shared-auth:${options.clientId}] ${req.method} ${req.nextUrl.pathname} -> redirect to login (origin=${externalOrigin})`);
    return NextResponse.redirect(loginUrl);
  }

  if (mode === 'silent') {
    // 무한 루프 방지: 직전에 silent auth 시도했으면 스킵
    const tried = req.cookies.get(SILENT_ATTEMPTED_COOKIE)?.value;
    if (tried) {
      console.log(`[shared-auth:${options.clientId}] ${req.method} ${req.nextUrl.pathname} -> silent skipped (tried)`);
      return NextResponse.next();
    }

    const redirectUri = `${externalOrigin}/auth/callback?returnTo=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
    const silentUrl = `${oauthUrl}/api/silent-auth?clientId=${options.clientId}&redirectUri=${encodeURIComponent(redirectUri)}`;
    console.log(`[shared-auth:${options.clientId}] ${req.method} ${req.nextUrl.pathname} -> silent SSO (origin=${externalOrigin})`);

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
