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
      c.name.includes('__Secure-next-auth') ||
      c.name.includes('__Host-next-auth')
    ) {
      // ★ __Secure-/__Host- 접두 쿠키(https 프로드의 세션 쿠키)는 삭제 Set-Cookie 에도
      // Secure 가 있어야 브라우저가 처리한다. 없으면 삭제가 거부돼 세션이 남고,
      // silent SSO 가 재로그인시켜 "로그아웃이 안 되는" 것처럼 보인다. (로컬 http 는 무관)
      const securePrefix = c.name.startsWith('__Secure-') || c.name.startsWith('__Host-');
      res.cookies.set(c.name, '', {
        maxAge: 0,
        path: '/',
        sameSite: 'lax',
        secure: securePrefix,
      });
    }
  }

  return res;
}
