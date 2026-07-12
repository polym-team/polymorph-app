import { NextResponse, type NextRequest } from 'next/server';
import { validateToken } from '@polymorph/shared-auth';
import { getValidAccessToken } from '@/lib/calendarBroker';
import { listCalendarEvents } from '@/lib/googleCalendar';

/**
 * 캘린더 이벤트 브로커 API (서버 간 호출 전용)
 *
 * GET /api/google/calendar/events?timeMin=&timeMax=
 * 헤더: x-internal-secret(서버간 시크릿), Authorization: Bearer <polymorph JWT>
 *
 * - refresh token 은 절대 노출하지 않고, oauth-server 가 access token 갱신 후
 *   구글 캘린더를 프록시해 이벤트만 돌려준다.
 * - userId 는 JWT(sub)에서만 취득.
 */
export async function GET(req: NextRequest) {
  // 1) 서버 간 시크릿 — 브라우저 직접 호출 차단
  const brokerSecret = process.env.CALENDAR_BROKER_SECRET;
  if (!brokerSecret || req.headers.get('x-internal-secret') !== brokerSecret) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  // 2) polymorph JWT 검증 → userId
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : null;
  if (!token) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const result = await validateToken(token);
  if (!result.valid || !result.payload?.sub) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
  }
  const userId = result.payload.sub;

  // 3) 유효한 access token 확보 (필요 시 자동 갱신)
  let accessToken: string | null;
  try {
    accessToken = await getValidAccessToken(userId);
  } catch (err) {
    console.error('[calendar broker] access token 갱신 실패:', err);
    // refresh token 이 무효화됐을 수 있음 → 앱이 재연동 유도하도록 신호
    return NextResponse.json({ error: 'refresh_failed' }, { status: 502 });
  }
  if (!accessToken) {
    return NextResponse.json({ error: 'not_connected' }, { status: 404 });
  }

  // 4) 캘린더 이벤트 조회 후 프록시
  const { searchParams } = new URL(req.url);
  const timeMin = searchParams.get('timeMin') ?? undefined;
  const timeMax = searchParams.get('timeMax') ?? undefined;

  try {
    const events = await listCalendarEvents(accessToken, { timeMin, timeMax });
    return NextResponse.json({ events });
  } catch (err) {
    console.error('[calendar broker] events.list 실패:', err);
    return NextResponse.json({ error: 'calendar_fetch_failed' }, { status: 502 });
  }
}
