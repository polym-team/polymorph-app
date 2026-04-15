import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * 글로벌 로그아웃: NextAuth 세션 쿠키 제거 + returnTo로 리다이렉트
 * 쿼리: ?returnTo=https://app.domain/...
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const returnTo = searchParams.get('returnTo') ?? '/';

  const res = NextResponse.redirect(returnTo);

  // NextAuth가 사용하는 대표 쿠키들 제거
  const cookieStore = await cookies();
  const all = cookieStore.getAll();
  for (const c of all) {
    if (
      c.name.includes('next-auth.session-token') ||
      c.name.includes('next-auth.csrf-token') ||
      c.name.includes('next-auth.callback-url') ||
      c.name.includes('__Secure-next-auth')
    ) {
      res.cookies.set(c.name, '', { maxAge: 0, path: '/' });
    }
  }

  return res;
}
