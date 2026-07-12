import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateToken, TOKEN_COOKIE } from '@polymorph/shared-auth';

/**
 * 현재 로그인된 유저 정보 조회 (JWT 페이로드 기반)
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  const result = await validateToken(token);
  if (!result.valid || !result.payload) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: result.payload.sub,
      email: result.payload.email,
      name: result.payload.name,
      provider: result.payload.provider,
    },
  });
}
