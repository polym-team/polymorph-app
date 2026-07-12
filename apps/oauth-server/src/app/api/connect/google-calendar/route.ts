import { randomBytes } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { buildCalendarAuthUrl, STATE_COOKIE } from '@/lib/googleCalendar';
import { isAllowedReturnUrl } from '@/lib/redirectUri';

/**
 * 구글 캘린더 연동 시작 (incremental authorization)
 *
 * GET /api/connect/google-calendar?clientId=<앱>&returnUrl=<복귀 URL>
 *
 * - 로그인된 oauth-server 세션 필요. 없으면 returnUrl?calendar=login_required 로 돌려보냄.
 * - returnUrl 은 해당 ClientApp 의 allowedRedirectUris origin 과 일치해야 함 (open redirect 방지).
 * - CSRF 방지: 랜덤 state 를 httpOnly 쿠키에 {s, r, c} 로 저장하고 구글에도 state 로 전달.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId');
  const returnUrl = searchParams.get('returnUrl');

  if (!clientId || !returnUrl) {
    return NextResponse.json(
      { error: 'clientId 와 returnUrl 이 필요합니다.' },
      { status: 400 },
    );
  }

  const app = await prisma.clientApp.findUnique({ where: { clientId } });
  if (!app || !app.enabled) {
    return NextResponse.json({ error: '알 수 없는 clientId 입니다.' }, { status: 400 });
  }
  if (!isAllowedReturnUrl(returnUrl, app.allowedRedirectUris)) {
    return NextResponse.json({ error: '허용되지 않은 returnUrl 입니다.' }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    // 앱이 로그인 상태를 보장하지 못한 경우: 앱으로 돌려보내 로그인부터 유도
    const back = new URL(returnUrl);
    back.searchParams.set('calendar', 'login_required');
    return NextResponse.redirect(back);
  }

  const state = randomBytes(32).toString('hex');
  const cookiePayload = Buffer.from(
    JSON.stringify({ s: state, r: returnUrl, c: clientId }),
  ).toString('base64url');

  const res = NextResponse.redirect(buildCalendarAuthUrl(state));
  res.cookies.set(STATE_COOKIE, cookiePayload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // 구글에서 top-level GET 리다이렉트로 돌아올 때 쿠키 전송 허용
    path: '/',
    maxAge: 600, // 10분
  });
  return res;
}
