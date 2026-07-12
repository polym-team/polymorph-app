import { authMiddleware } from '@polymorph/shared-auth/middleware';
import type { NextRequest } from 'next/server';

const CLIENT_ID = 'myflighthistory';

export async function middleware(req: NextRequest) {
  const oauthServerUrl =
    process.env.NEXT_PUBLIC_OAUTH_SERVER_URL ?? 'https://oauth.polymorph.co.kr';

  return authMiddleware(req, {
    clientId: CLIENT_ID,
    oauthServerUrl,
    onUnauthenticated: 'silent',
  });
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicons|favicon.ico|robots.txt|sitemap.xml|auth/callback).*)',
  ],
};
