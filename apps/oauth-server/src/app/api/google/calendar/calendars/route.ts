import { NextResponse, type NextRequest } from 'next/server';
import { getValidAccessToken } from '@/lib/calendarBroker';
import { listCalendars, createCalendar } from '@/lib/googleCalendar';
import { authenticateBroker } from '@/lib/brokerAuth';

/**
 * 캘린더 목록/생성 브로커 (서버 간 호출 전용)
 *
 * GET  → { calendars: [{ id, summary, primary }] }
 * POST { summary } → { id, summary }
 */
export async function GET(req: NextRequest) {
  const auth = await authenticateBroker(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const token = await getValidAccessToken(auth.userId).catch(() => null);
  if (!token) {
    return NextResponse.json({ error: 'not_connected' }, { status: 404 });
  }

  try {
    const calendars = await listCalendars(token);
    return NextResponse.json({ calendars });
  } catch (err) {
    console.error('[calendar broker] calendarList 실패:', err);
    return NextResponse.json({ error: 'calendar_list_failed' }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticateBroker(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = (await req.json().catch(() => null)) as { summary?: string } | null;
  if (!body?.summary) {
    return NextResponse.json({ error: 'summary 가 필요합니다.' }, { status: 400 });
  }

  const token = await getValidAccessToken(auth.userId).catch(() => null);
  if (!token) {
    return NextResponse.json({ error: 'not_connected' }, { status: 404 });
  }

  try {
    const created = await createCalendar(token, body.summary);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error('[calendar broker] calendars.insert 실패:', err);
    return NextResponse.json({ error: 'calendar_create_failed' }, { status: 502 });
  }
}
