import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { TOKEN_COOKIE } from '@polymorph/shared-auth';

/**
 * 로컬 인증 쿠키 제거
 * 필요하면 클라이언트가 추가로 oauth-server /api/logout도 호출
 */
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, '', { maxAge: 0, path: '/' });
  return NextResponse.json({ success: true });
}
