import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { TOKEN_COOKIE } from '@polymorph/shared-auth';

const OAUTH = process.env.NEXT_PUBLIC_OAUTH_SERVER_URL ?? 'https://oauth.polymorph.co.kr';
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? '';

/** GET /api/auth/logout — 로컬 쿠키 제거 후 oauth-server 로그아웃으로 리다이렉트 */
export async function GET() {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, '', { maxAge: 0, path: '/' });
  const returnUrl = encodeURIComponent(BASE || '/');
  return NextResponse.redirect(`${OAUTH}/logout?returnUrl=${returnUrl}`);
}
