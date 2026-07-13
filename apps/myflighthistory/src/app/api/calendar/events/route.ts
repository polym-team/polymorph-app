import { NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/session';
import {
  BrokerError,
  fetchCalendarEvents,
  findOrCreateFlightCalendar,
} from '@/lib/calendarClient';
import { extractFlights, mergeFlights } from '@/lib/flightParser';
import { predictDelay } from '@/lib/prediction';

const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * 내 항공편을 하이브리드로 수집:
 *  - primary 캘린더(구글 Gmail 자동생성) → 휴리스틱 파싱
 *  - 전용 "MyFlightHistory" 캘린더(우리 수동 등록) → extendedProperties 무손실 복원
 * 두 소스를 병합·중복제거해서 반환.
 */
export async function GET() {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const now = Date.now();
  const timeMin = new Date(now - YEAR_MS).toISOString();
  const timeMax = new Date(now + YEAR_MS).toISOString();

  // 전용 캘린더 확보 (미연결이면 여기서 판별)
  let dedicatedId: string | null = null;
  let dedicatedUnavailable = false;
  try {
    dedicatedId = await findOrCreateFlightCalendar(token);
  } catch (err) {
    if (err instanceof BrokerError && err.status === 404) {
      return NextResponse.json({ connected: false, flights: [] });
    }
    if (err instanceof BrokerError && err.code === 'refresh_failed') {
      return NextResponse.json({ connected: false, needsReconnect: true, flights: [] });
    }
    // 쓰기 권한 부족(scope 미상향) 등 → 자동 소스만이라도 보여주도록 degrade
    console.error('[calendar/events] 전용 캘린더 사용 불가:', err);
    dedicatedUnavailable = true;
  }

  try {
    const primaryEvents = await fetchCalendarEvents(token, { timeMin, timeMax });
    const dedicatedEvents = dedicatedId
      ? await fetchCalendarEvents(token, { calendarId: dedicatedId, timeMin, timeMax })
      : [];

    const merged = mergeFlights([
      ...extractFlights(primaryEvents),
      ...extractFlights(dedicatedEvents, dedicatedId ?? undefined),
    ]);

    // 예정(미래) 항공편에만 지연 예측 부여
    const nowIso = new Date().toISOString();
    const flights = merged.map((f) =>
      f.departure && f.departure >= nowIso
        ? {
            ...f,
            prediction: predictDelay({
              flightNumber: f.flightNumber,
              from: f.from,
              to: f.to,
              departure: f.departure,
            }),
          }
        : f,
    );

    return NextResponse.json({
      connected: true,
      dedicatedCalendarId: dedicatedId,
      dedicatedUnavailable,
      flights,
    });
  } catch (err) {
    if (err instanceof BrokerError && err.status === 404) {
      return NextResponse.json({ connected: false, flights: [] });
    }
    if (err instanceof BrokerError && err.code === 'refresh_failed') {
      return NextResponse.json({ connected: false, needsReconnect: true, flights: [] });
    }
    console.error('[calendar/events] 조회 실패:', err);
    return NextResponse.json({ error: 'broker_error' }, { status: 502 });
  }
}
