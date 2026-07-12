import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { exchangeCalendarCode, STATE_COOKIE } from '@/lib/googleCalendar';
import { isAllowedReturnUrl } from '@/lib/redirectUri';
import { encryptToken } from '@/lib/tokenCrypto';

/** returnUrl 에 결과 플래그를 붙여 리다이렉트 응답을 만들고, state 쿠키를 정리한다. */
function redirectBack(returnUrl: string, status: string): NextResponse {
  const url = new URL(returnUrl);
  url.searchParams.set('calendar', status);
  const res = NextResponse.redirect(url);
  res.cookies.delete(STATE_COOKIE);
  return res;
}

/**
 * 구글 캘린더 연동 콜백
 *
 * GET /api/connect/google-calendar/callback?code=&state=[&error=]
 *
 * - state 쿠키와 대조해 CSRF 검증, returnUrl/clientId 재검증
 * - code → refresh/access token 교환 후 암호화하여 GoogleCalendarGrant upsert
 * - userId 는 쿠키가 아닌 서버 세션에서만 취득 (스푸핑 방지)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const oauthError = searchParams.get('error');

  // state 쿠키 파싱 (returnUrl 확보의 유일한 신뢰 경로)
  const rawCookie = req.cookies.get(STATE_COOKIE)?.value;
  let cookie: { s: string; r: string; c: string } | null = null;
  if (rawCookie) {
    try {
      cookie = JSON.parse(Buffer.from(rawCookie, 'base64url').toString('utf8'));
    } catch {
      cookie = null;
    }
  }

  // 쿠키/state 자체가 깨졌으면 안전하게 돌려보낼 곳이 없으므로 400
  if (!cookie || !cookie.r || cookie.s !== state) {
    return NextResponse.json(
      { error: 'state 검증 실패 (CSRF 방지).' },
      { status: 400 },
    );
  }

  // 이제부터는 항상 앱으로 리다이렉트해 사용자 경험을 매끄럽게
  const returnUrl = cookie.r;

  // returnUrl/clientId 재검증 (쿠키 변조 대비)
  const app = await prisma.clientApp.findUnique({ where: { clientId: cookie.c } });
  if (!app || !app.enabled || !isAllowedReturnUrl(returnUrl, app.allowedRedirectUris)) {
    return NextResponse.json({ error: '유효하지 않은 요청입니다.' }, { status: 400 });
  }

  if (oauthError) {
    // 사용자가 동의를 거부한 경우 등
    return redirectBack(returnUrl, oauthError === 'access_denied' ? 'denied' : 'error');
  }
  if (!code) {
    return redirectBack(returnUrl, 'error');
  }

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return redirectBack(returnUrl, 'login_required');
  }

  try {
    const tokens = await exchangeCalendarCode(code);
    const accessTokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // prompt=consent 로 refresh_token 이 매번 오지만, 혹시 없으면 기존 값 유지
    const encRefresh = tokens.refresh_token
      ? encryptToken(tokens.refresh_token)
      : undefined;

    // 최초 연결인데 refresh_token 이 없으면 갱신 불가 상태 → 깨진 grant 저장 대신 재동의 유도
    if (!encRefresh) {
      const existing = await prisma.googleCalendarGrant.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (!existing) {
        console.error(
          '[google-calendar callback] 최초 연결인데 refresh_token 미수신 — 재연동 필요',
        );
        return redirectBack(returnUrl, 'error');
      }
    }

    await prisma.googleCalendarGrant.upsert({
      where: { userId },
      create: {
        userId,
        // 최초 연결인데 refresh_token 이 없으면 재연동 불가 상태이므로 방어적으로 처리
        refreshToken: encRefresh ?? '',
        accessToken: encryptToken(tokens.access_token),
        accessTokenExpiresAt,
        scopes: tokens.scope,
      },
      update: {
        ...(encRefresh ? { refreshToken: encRefresh } : {}),
        accessToken: encryptToken(tokens.access_token),
        accessTokenExpiresAt,
        scopes: tokens.scope,
      },
    });

    return redirectBack(returnUrl, 'connected');
  } catch (err) {
    console.error('[google-calendar callback] 토큰 교환/저장 실패:', err);
    return redirectBack(returnUrl, 'error');
  }
}
