import { authMiddleware } from '@polymorph/shared-auth/middleware';
import type { NextRequest } from 'next/server';

const CLIENT_ID = 'direct-feedback';

export async function middleware(req: NextRequest) {
  const oauthServerUrl =
    process.env.NEXT_PUBLIC_OAUTH_SERVER_URL ?? 'https://oauth.polymorph.co.kr';

  // NextRequest 는 런타임상 동일하지만, pnpm peer 해석으로 앱(react18)과
  // @polymorph/shared-auth(react19)가 서로 다른 next 인스턴스 타입을 갖는다.
  // authMiddleware 가 기대하는 타입으로 캐스팅해 nominal 불일치만 해소한다.
  return authMiddleware(req as unknown as Parameters<typeof authMiddleware>[0], {
    clientId: CLIENT_ID,
    oauthServerUrl,
    onUnauthenticated: 'silent',
  });
}

// API 라우트는 미들웨어에서 제외 — 확장(Bearer)/쿠키 인증을 라우트 내부(src/lib/auth.ts)에서 처리.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicons|favicon.ico|robots.txt|sitemap.xml|auth/callback).*)',
  ],
};
