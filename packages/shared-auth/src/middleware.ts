import { NextResponse, type NextRequest } from 'next/server';
import { validateToken } from './jwt';

const TOKEN_COOKIE_NAME = 'polymorph_auth';

export interface MiddlewareOptions {
  /** 인증이 필요한 경로 패턴 (예: ['/api/protected/:path*']). 매처는 next.config의 matcher로 별도 설정 권장 */
  /** 인증 실패 시 oauth-server의 로그인 페이지로 리다이렉트할지 여부. false면 401 응답 */
  redirectOnFail?: boolean;
  /** 클라이언트 앱 ID (oauth-server에 등록된 ID) */
  clientId: string;
  /** oauth-server URL (기본: https://oauth.polymorph.co.kr) */
  oauthServerUrl?: string;
}

/**
 * 인증 미들웨어 헬퍼
 * 쿠키에서 토큰을 추출하고 검증, 통과 시 x-user-* 헤더 추가
 */
export async function authMiddleware(
  req: NextRequest,
  options: MiddlewareOptions,
): Promise<NextResponse> {
  const token = req.cookies.get(TOKEN_COOKIE_NAME)?.value;

  if (!token) {
    return handleUnauthorized(req, options);
  }

  const result = await validateToken(token);

  if (!result.valid || !result.payload) {
    return handleUnauthorized(req, options);
  }

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

function handleUnauthorized(req: NextRequest, options: MiddlewareOptions): NextResponse {
  if (options.redirectOnFail) {
    const oauthUrl = options.oauthServerUrl ?? 'https://oauth.polymorph.co.kr';
    const redirectUri = `${req.nextUrl.origin}/auth/callback`;
    const loginUrl = `${oauthUrl}/login?clientId=${options.clientId}&redirectUri=${encodeURIComponent(redirectUri)}`;
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export const TOKEN_COOKIE = TOKEN_COOKIE_NAME;
