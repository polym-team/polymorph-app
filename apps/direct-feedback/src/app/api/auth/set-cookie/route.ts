import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateToken, TOKEN_COOKIE } from '@polymorph/shared-auth';

export const dynamic = 'force-dynamic';

// OAuth 콜백에서 받은 JWT 를 HttpOnly 쿠키로 저장 (대시보드 웹 세션).
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { token?: string };
  const token = body.token;
  if (!token) {
    return NextResponse.json({ error: '토큰이 없습니다.' }, { status: 400 });
  }
  const result = await validateToken(token);
  if (!result.valid || !result.payload) {
    return NextResponse.json({ error: '유효하지 않은 토큰' }, { status: 401 });
  }

  const now = Math.floor(Date.now() / 1000);
  const maxAge = result.payload.exp ? result.payload.exp - now : 60 * 60 * 24 * 7;

  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, token, {
    maxAge,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  return NextResponse.json({ success: true });
}
