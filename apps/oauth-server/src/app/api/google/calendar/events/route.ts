import { NextResponse, type NextRequest } from 'next/server';
import { getValidAccessToken } from '@/lib/calendarBroker';
import {
  listCalendarEvents,
  insertCalendarEvent,
  deleteCalendarEvent,
  type CalendarEventInput,
} from '@/lib/googleCalendar';
import { authenticateBroker } from '@/lib/brokerAuth';

/**
 * 캘린더 이벤트 브로커 (서버 간 호출 전용)
 * 헤더: x-internal-secret + Authorization: Bearer <polymorph JWT>
 *
 * GET    ?calendarId=&timeMin=&timeMax=  → 이벤트 목록
 * POST   { calendarId, event }           → 이벤트 생성
 * DELETE ?calendarId=&eventId=           → 이벤트 삭제
 */
export async function GET(req: NextRequest) {
  const auth = await authenticateBroker(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const accessToken = await resolveToken(auth.userId);
  if ('response' in accessToken) return accessToken.response;

  const { searchParams } = new URL(req.url);
  const calendarId = searchParams.get('calendarId') ?? 'primary';
  const timeMin = searchParams.get('timeMin') ?? undefined;
  const timeMax = searchParams.get('timeMax') ?? undefined;

  try {
    const events = await listCalendarEvents(accessToken.token, {
      calendarId,
      timeMin,
      timeMax,
    });
    return NextResponse.json({ events });
  } catch (err) {
    console.error('[calendar broker] events.list 실패:', err);
    return NextResponse.json({ error: 'calendar_fetch_failed' }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticateBroker(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = (await req.json().catch(() => null)) as {
    calendarId?: string;
    event?: CalendarEventInput;
  } | null;
  if (!body?.calendarId || !body.event) {
    return NextResponse.json(
      { error: 'calendarId 와 event 가 필요합니다.' },
      { status: 400 },
    );
  }

  const accessToken = await resolveToken(auth.userId);
  if ('response' in accessToken) return accessToken.response;

  try {
    const created = await insertCalendarEvent(
      accessToken.token,
      body.calendarId,
      body.event,
    );
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error('[calendar broker] events.insert 실패:', err);
    return NextResponse.json({ error: 'calendar_insert_failed' }, { status: 502 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await authenticateBroker(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const calendarId = searchParams.get('calendarId');
  const eventId = searchParams.get('eventId');
  if (!calendarId || !eventId) {
    return NextResponse.json(
      { error: 'calendarId 와 eventId 가 필요합니다.' },
      { status: 400 },
    );
  }

  const accessToken = await resolveToken(auth.userId);
  if ('response' in accessToken) return accessToken.response;

  try {
    await deleteCalendarEvent(accessToken.token, calendarId, eventId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[calendar broker] events.delete 실패:', err);
    return NextResponse.json({ error: 'calendar_delete_failed' }, { status: 502 });
  }
}

/** 유효한 access token 확보(자동 갱신). 미연결/갱신실패는 NextResponse 로 반환. */
async function resolveToken(
  userId: string,
): Promise<{ token: string } | { response: NextResponse }> {
  let token: string | null;
  try {
    token = await getValidAccessToken(userId);
  } catch (err) {
    console.error('[calendar broker] access token 갱신 실패:', err);
    return {
      response: NextResponse.json({ error: 'refresh_failed' }, { status: 502 }),
    };
  }
  if (!token) {
    return {
      response: NextResponse.json({ error: 'not_connected' }, { status: 404 }),
    };
  }
  return { token };
}
