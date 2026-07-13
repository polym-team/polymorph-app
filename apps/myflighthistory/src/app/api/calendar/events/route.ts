import { NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/session';
import {
  BrokerError,
  fetchCalendarEvents,
  findOrCreateFlightCalendar,
} from '@/lib/calendarClient';
import { extractFlights, mergeFlights, type ParsedFlight } from '@/lib/flightParser';
import { predictDelay, isDomesticPlace } from '@/lib/prediction';
import { fetchIncheonDeparture } from '@/lib/incheon';
import type { LiveStatus } from '@/lib/liveStatus';

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

    // 예정(미래) 항공편에 지연 예측(휴리스틱) 부여
    const nowIso = new Date().toISOString();
    const withPrediction = merged.map((f) =>
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

    // 임박 항공편에 실시간 상태(공공데이터) 부여 — 예측보다 우선 표시
    const flights = await attachLiveStatus(withPrediction);

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

const LIVE_AHEAD_MS = 6 * 24 * 60 * 60 * 1000; // 인천 API 조회창 D+6
const LIVE_BEHIND_MS = 12 * 60 * 60 * 1000;

/**
 * 임박 항공편에 실시간 상태(공공데이터)를 병렬로 부여.
 * - 국제선(도착지가 국내 아님): 인천공항 공식 API
 * - 국내선: airportal (추후) — 현재는 미부여, 휴리스틱 예측 유지
 * 실패는 조용히 무시(휴리스틱 fallback).
 */
async function attachLiveStatus(flights: ParsedFlight[]): Promise<ParsedFlight[]> {
  if (!process.env.DATAGO_SERVICE_KEY) return flights;

  const now = Date.now();
  const eligible = flights.filter((f) => {
    if (!f.flightNumber || !f.departure) return false;
    const t = new Date(f.departure).getTime();
    return (
      !Number.isNaN(t) && t >= now - LIVE_BEHIND_MS && t <= now + LIVE_AHEAD_MS
    );
  });
  if (eligible.length === 0) return flights;

  const byId = new Map<string, LiveStatus>();
  await Promise.all(
    eligible.map(async (f) => {
      if (isDomesticPlace(f.to)) return; // 국내선은 airportal(추후) 담당
      const searchDate = f.departure!.slice(0, 10).replace(/-/g, '');
      const st = await fetchIncheonDeparture(f.flightNumber!, searchDate);
      if (st) byId.set(f.id, st);
    }),
  );

  if (byId.size === 0) return flights;
  return flights.map((f) =>
    byId.has(f.id) ? { ...f, liveStatus: byId.get(f.id) } : f,
  );
}
