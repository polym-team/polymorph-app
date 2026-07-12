import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { TOKEN_COOKIE } from '@polymorph/shared-auth';
import { OAUTH_SERVER_INTERNAL_URL } from '@/lib/oauth';
import { extractFlights, type CalendarEventDTO } from '@/lib/flightParser';

const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * 내 캘린더에서 항공편을 추출해 반환.
 *
 * 브라우저 → 이 라우트(서버) → oauth-server 브로커.
 * 브로커 시크릿과 사용자 JWT 는 서버사이드에서만 다루고 클라이언트에 노출하지 않는다.
 */
export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const brokerSecret = process.env.CALENDAR_BROKER_SECRET;
  if (!brokerSecret) {
    console.error('[calendar/events] CALENDAR_BROKER_SECRET 미설정');
    return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const now = Date.now();
  const timeMin = searchParams.get('timeMin') ?? new Date(now - YEAR_MS).toISOString();
  const timeMax = searchParams.get('timeMax') ?? new Date(now + YEAR_MS).toISOString();

  const brokerUrl = new URL(
    `${OAUTH_SERVER_INTERNAL_URL}/api/google/calendar/events`,
  );
  brokerUrl.searchParams.set('timeMin', timeMin);
  brokerUrl.searchParams.set('timeMax', timeMax);

  let res: Response;
  try {
    res = await fetch(brokerUrl, {
      headers: {
        'x-internal-secret': brokerSecret,
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });
  } catch (err) {
    console.error('[calendar/events] 브로커 호출 실패:', err);
    return NextResponse.json({ error: 'broker_unreachable' }, { status: 502 });
  }

  if (res.status === 404) {
    // 캘린더 미연결
    return NextResponse.json({ connected: false, flights: [] });
  }
  if (res.status === 502) {
    // refresh 실패 → 재연동 필요 신호
    return NextResponse.json({ connected: false, needsReconnect: true, flights: [] });
  }
  if (!res.ok) {
    return NextResponse.json({ error: 'broker_error' }, { status: 502 });
  }

  const data = (await res.json()) as { events?: CalendarEventDTO[] };
  const flights = extractFlights(data.events ?? []);
  return NextResponse.json({ connected: true, flights });
}
