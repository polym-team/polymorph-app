import { authMiddleware } from '@polymorph/shared-auth/middleware';
import type { NextRequest } from 'next/server';

// 페이지(웹 서비스 페이지)에 silent SSO 적용. API 라우트는 자체 인증(getAuthUser)으로 처리.
export default function middleware(req: NextRequest) {
  // 모노레포에 next 14/15가 공존해 shared-auth의 NextRequest 타입이 next15로 잡힌다.
  // 런타임 동작은 동일하므로 호출부에서만 캐스팅(jibsayo도 동일 dual-next 아티팩트).
  return authMiddleware(req as unknown as Parameters<typeof authMiddleware>[0], {
    clientId: 'tallo',
    onUnauthenticated: 'silent',
    oauthServerUrl: process.env.NEXT_PUBLIC_OAUTH_SERVER_URL,
  });
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|auth/callback).*)',
  ],
};
