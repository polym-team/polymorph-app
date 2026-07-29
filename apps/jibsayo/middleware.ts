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

  // jibsayo는 next@14, shared-auth(6개 앱 공유)는 모노레포 표준 next@15 타입으로 해석된다.
  // NextRequest는 두 버전 런타임 호환이며 nextUrl 내부 브랜드 타입만 달라 경계에서 캐스트로 연결한다.
  // (jibsayo를 next@15로 올리면 이 캐스트 제거)
  return authMiddleware(req as unknown as Parameters<typeof authMiddleware>[0], {
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
