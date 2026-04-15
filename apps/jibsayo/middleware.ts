import { authMiddleware } from '@polymorph/shared-auth/middleware';
import type { NextRequest } from 'next/server';

const CLIENT_ID = 'jibsayo';

/**
 * jibsayo 인증 미들웨어
 *
 * - silent SSO: oauth-server에 SSO 세션이 있으면 자동 로그인 (사용자 클릭 없이)
 * - 세션 없으면 비로그인 상태로 진행 (강제 로그인 X)
 *
 * NOTE: 웹뷰는 deviceId 기반 흐름이라 인증 안 되어 있으면 그냥 비로그인 진행
 *       (TODO: 네이티브 앱 출시 후 oauth 통합 재검토)
 */
export async function middleware(req: NextRequest) {
  const oauthServerUrl =
    process.env.NEXT_PUBLIC_OAUTH_SERVER_URL ?? 'https://oauth.polymorph.co.kr';

  return authMiddleware(req, {
    clientId: CLIENT_ID,
    oauthServerUrl,
    onUnauthenticated: 'silent',
  });
}

// 페이지 진입에만 적용 (API/정적 파일/auth 경로 제외)
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicons|favicon.ico|robots.txt|sitemap.xml|auth/callback).*)',
  ],
};
