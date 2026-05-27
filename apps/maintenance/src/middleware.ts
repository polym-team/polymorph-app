import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = '/';

  return NextResponse.rewrite(url, {
    status: 503,
    headers: {
      'Retry-After': '3600',
      'Cache-Control': 'no-store, must-revalidate',
    },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
