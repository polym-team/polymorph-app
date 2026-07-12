import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { TOKEN_COOKIE } from '@polymorph/shared-auth';

/**
 * 로컬 인증 쿠키 제거 (oauth-server SSO 세션은 별도)
 */
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, '', { maxAge: 0, path: '/' });
  return NextResponse.json({ success: true });
}
