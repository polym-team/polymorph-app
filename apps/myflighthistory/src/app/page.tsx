'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { CLIENT_ID, OAUTH_SERVER_URL } from '@/lib/oauth';
import type { ParsedFlight } from '@/lib/flightParser';

interface Me {
  authenticated: boolean;
  user?: { id: string; email: string; name?: string };
}

interface CalendarResult {
  connected: boolean;
  needsReconnect?: boolean;
  flights: ParsedFlight[];
}

const BANNER: Record<string, { text: string; tone: 'ok' | 'warn' }> = {
  connected: { text: '구글 캘린더가 연결되었습니다.', tone: 'ok' },
  denied: { text: '캘린더 접근 동의가 취소되었습니다.', tone: 'warn' },
  error: { text: '캘린더 연결 중 오류가 발생했습니다. 다시 시도해 주세요.', tone: 'warn' },
  login_required: { text: '먼저 로그인이 필요합니다.', tone: 'warn' },
};

export default function HomePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [cal, setCal] = useState<CalendarResult | null>(null);
  const [banner, setBanner] = useState<(typeof BANNER)[string] | null>(null);

  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get('calendar');
    if (status && BANNER[status]) {
      setBanner(BANNER[status]);
      // 배너 표시 후 쿼리 정리
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const loadFlights = useCallback(() => {
    fetch('/api/calendar/events')
      .then((r) => (r.ok ? r.json() : { connected: false, flights: [] }))
      .then(setCal)
      .catch(() => setCal({ connected: false, flights: [] }));
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data: Me) => {
        setMe(data);
        if (data.authenticated) loadFlights();
      })
      .catch(() => setMe({ authenticated: false }));
  }, [loadFlights]);

  function connectCalendar() {
    const returnUrl = `${window.location.origin}/`;
    window.location.href =
      `${OAUTH_SERVER_URL}/api/connect/google-calendar` +
      `?clientId=${CLIENT_ID}&returnUrl=${encodeURIComponent(returnUrl)}`;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold">MyFlightHistory</h1>
        <p className="text-sm text-gray-500">내 항공편을 한눈에 — 과거·현재·미래(지연 예측)</p>
      </header>

      {banner && (
        <div
          className={`rounded p-3 text-sm ${
            banner.tone === 'ok'
              ? 'bg-green-50 text-green-700'
              : 'bg-amber-50 text-amber-700'
          }`}
        >
          {banner.text}
        </div>
      )}

      {me === null ? (
        <p className="text-sm text-gray-400">불러오는 중...</p>
      ) : !me.authenticated ? (
        <LoggedOut />
      ) : (
        <LoggedIn me={me} cal={cal} onConnect={connectCalendar} />
      )}
    </div>
  );
}

function LoggedOut() {
  return (
    <div className="rounded border bg-white p-4 text-sm">
      <p className="mb-3 text-gray-600">시작하려면 로그인하세요.</p>
      <Link
        href="/login"
        className="inline-flex h-10 items-center rounded bg-gray-900 px-4 text-white"
      >
        로그인
      </Link>
    </div>
  );
}

function LoggedIn({
  me,
  cal,
  onConnect,
}: {
  me: Me;
  cal: CalendarResult | null;
  onConnect: () => void;
}) {
  const now = new Date().toISOString();

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-600">
        <span className="font-medium">{me.user?.name ?? me.user?.email}</span> 님
      </p>

      {cal === null ? (
        <p className="text-sm text-gray-400">캘린더 확인 중...</p>
      ) : !cal.connected ? (
        <div className="rounded border bg-white p-4 text-sm">
          <p className="mb-1 font-medium">구글 캘린더 연결</p>
          <p className="mb-3 text-gray-500">
            {cal.needsReconnect
              ? '연결이 만료되어 다시 연결이 필요합니다.'
              : '캘린더의 항공편 일정을 자동으로 불러옵니다.'}
          </p>
          <button
            onClick={onConnect}
            className="inline-flex h-10 items-center rounded bg-blue-600 px-4 text-white"
          >
            구글 캘린더 연결하기
          </button>
        </div>
      ) : (
        <FlightList flights={cal.flights} now={now} onReconnect={onConnect} />
      )}
    </div>
  );
}

function FlightList({
  flights,
  now,
  onReconnect,
}: {
  flights: ParsedFlight[];
  now: string;
  onReconnect: () => void;
}) {
  if (flights.length === 0) {
    return (
      <div className="rounded border bg-white p-4 text-sm text-gray-500">
        캘린더에서 항공편으로 보이는 일정을 찾지 못했습니다. 곧 수동 등록 기능이 추가됩니다.
      </div>
    );
  }

  const upcoming = flights.filter((f) => (f.departure ?? '') >= now);
  const past = flights.filter((f) => (f.departure ?? '') < now);

  return (
    <div className="space-y-5">
      <button onClick={onReconnect} className="text-xs text-gray-400 underline">
        캘린더 다시 연결
      </button>
      <FlightSection title="예정된 항공편" flights={upcoming} />
      <FlightSection title="지난 항공편" flights={past} />
    </div>
  );
}

function FlightSection({ title, flights }: { title: string; flights: ParsedFlight[] }) {
  if (flights.length === 0) return null;
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-gray-700">{title}</h2>
      <ul className="space-y-2">
        {flights.map((f) => (
          <li key={f.id} className="rounded border bg-white p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">{f.title}</span>
              {f.flightNumber && (
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {f.flightNumber}
                </span>
              )}
            </div>
            {(f.from || f.to) && (
              <p className="mt-1 text-gray-500">
                {f.from ?? '?'} → {f.to ?? '?'}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-400">
              {formatDate(f.departure)} {f.arrival ? `~ ${formatDate(f.arrival)}` : ''}
              {f.confidence === 'low' && ' · 자동 인식(확인 필요)'}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: iso.includes('T') ? '2-digit' : undefined,
    minute: iso.includes('T') ? '2-digit' : undefined,
  });
}
