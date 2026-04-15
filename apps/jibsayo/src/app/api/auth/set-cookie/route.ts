import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateToken, TOKEN_COOKIE } from '@polymorph/shared-auth';

/**
 * OAuth callback에서 받은 JWT를 HttpOnly 쿠키에 저장
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({})) as { token?: string };
  const token = body.token;
  if (!token) {
    return NextResponse.json({ error: '토큰이 없습니다.' }, { status: 400 });
  }

  const result = await validateToken(token);
  if (!result.valid || !result.payload) {
    return NextResponse.json({ error: '유효하지 않은 토큰' }, { status: 401 });
  }

  // exp 기반 maxAge 계산 (exp는 UNIX timestamp 초)
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
  // silent auth 시도 마커 쿠키 정리 (성공했으니 다시 시도 가능 상태로)
  cookieStore.set('polymorph_silent_auth_tried', '', { maxAge: 0, path: '/' });

  return NextResponse.json({ success: true });
}
