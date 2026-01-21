import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow API auth routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for session token
  const sessionToken = request.cookies.get('authjs.session-token')?.value ||
    request.cookies.get('__Secure-authjs.session-token')?.value;

  const isLoggedIn = !!sessionToken;
  const isOnLoginPage = pathname === '/login';
  const isOnPublicPage = pathname === '/';

  // Redirect logged-in users away from login page
  if (isOnLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/bookmarks', request.url));
  }

  // Allow public pages and login page
  if (isOnPublicPage || isOnLoginPage) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
