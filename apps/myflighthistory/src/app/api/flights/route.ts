import { NextResponse, type NextRequest } from 'next/server';
import { getAuthToken } from '@/lib/session';
import {
  BrokerError,
  createFlightEvent,
  findOrCreateFlightCalendar,
  removeFlightEvent,
} from '@/lib/calendarClient';
import { buildFlightEventInput, type FlightData } from '@/lib/flightEvent';

function mapBrokerError(err: unknown): NextResponse {
  if (err instanceof BrokerError) {
    if (err.status === 404) {
      return NextResponse.json({ error: 'not_connected' }, { status: 409 });
    }
    // 쓰기 권한 부족 등 → 재연동 유도
    return NextResponse.json({ error: 'needs_reconnect' }, { status: 409 });
  }
  console.error('[flights] 처리 실패:', err);
  return NextResponse.json({ error: 'server_error' }, { status: 500 });
}

/**
 * 항공편 수동 등록 → 전용 캘린더에 정규 이벤트로 write-back.
 * POST { flightNumber, from?, to?, departure(ISO), arrival?(ISO) }
 */
export async function POST(req: NextRequest) {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Partial<FlightData> | null;
  if (!body?.flightNumber?.trim() || !body.departure) {
    return NextResponse.json(
      { error: '편명(flightNumber)과 출발시각(departure)은 필수입니다.' },
      { status: 400 },
    );
  }

  const data: FlightData = {
    flightNumber: body.flightNumber.trim().toUpperCase().replace(/\s+/g, ''),
    from: body.from?.trim() || null,
    to: body.to?.trim() || null,
    departure: body.departure,
    arrival: body.arrival || null,
  };

  try {
    const calendarId = await findOrCreateFlightCalendar(token);
    const { id } = await createFlightEvent(token, calendarId, buildFlightEventInput(data));
    return NextResponse.json({ id, calendarId }, { status: 201 });
  } catch (err) {
    return mapBrokerError(err);
  }
}

/**
 * 수동 등록 항공편 삭제.
 * DELETE ?calendarId=&eventId=
 */
export async function DELETE(req: NextRequest) {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
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

  try {
    await removeFlightEvent(token, calendarId, eventId);
    return NextResponse.json({ success: true });
  } catch (err) {
    return mapBrokerError(err);
  }
}
