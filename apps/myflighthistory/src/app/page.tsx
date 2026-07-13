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
  dedicatedUnavailable?: boolean;
  flights: ParsedFlight[];
}

const BANNER: Record<string, { text: string; tone: 'ok' | 'warn' }> = {
  connected: { text: '구글 캘린더가 연결되었습니다.', tone: 'ok' },
  denied: { text: '캘린더 접근 동의가 취소되었습니다.', tone: 'warn' },
  error: { text: '캘린더 연결 중 오류가 발생했습니다. 다시 시도해 주세요.', tone: 'warn' },
  login_required: { text: '먼저 로그인이 필요합니다.', tone: 'warn' },
};

function connectCalendar() {
  const returnUrl = `${window.location.origin}/`;
  window.location.href =
    `${OAUTH_SERVER_URL}/api/connect/google-calendar` +
    `?clientId=${CLIENT_ID}&returnUrl=${encodeURIComponent(returnUrl)}`;
}

export default function HomePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [cal, setCal] = useState<CalendarResult | null>(null);
  const [banner, setBanner] = useState<(typeof BANNER)[string] | null>(null);

  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get('calendar');
    if (status && BANNER[status]) {
      setBanner(BANNER[status]);
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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold">MyFlightHistory</h1>
        <p className="text-sm text-gray-500">내 항공편을 한눈에 — 과거·현재·미래(지연 예측)</p>
      </header>

      {banner && (
        <div
          className={`rounded p-3 text-sm ${
            banner.tone === 'ok' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
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
        <LoggedIn me={me} cal={cal} reload={loadFlights} />
      )}
    </div>
  );
}

function LoggedOut() {
  return (
    <div className="rounded border bg-white p-4 text-sm">
      <p className="mb-3 text-gray-600">시작하려면 로그인하세요.</p>
      <Link href="/login" className="inline-flex h-10 items-center rounded bg-gray-900 px-4 text-white">
        로그인
      </Link>
    </div>
  );
}

function LoggedIn({ me, cal, reload }: { me: Me; cal: CalendarResult | null; reload: () => void }) {
  if (cal === null) return <p className="text-sm text-gray-400">캘린더 확인 중...</p>;

  if (!cal.connected) {
    return (
      <div className="rounded border bg-white p-4 text-sm">
        <p className="mb-1 font-medium">구글 캘린더 연결</p>
        <p className="mb-3 text-gray-500">
          {cal.needsReconnect
            ? '연결이 만료되어 다시 연결이 필요합니다.'
            : '캘린더의 항공편 일정을 자동으로 불러오고, 수동 등록한 항공편도 캘린더에 저장합니다.'}
        </p>
        <button onClick={connectCalendar} className="inline-flex h-10 items-center rounded bg-blue-600 px-4 text-white">
          구글 캘린더 연결하기
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-600">
        <span className="font-medium">{me.user?.name ?? me.user?.email}</span> 님
      </p>

      {cal.dedicatedUnavailable && (
        <div className="rounded bg-amber-50 p-3 text-sm text-amber-700">
          수동 등록(캘린더 쓰기) 권한이 없어 자동 인식 항공편만 표시 중입니다.{' '}
          <button onClick={connectCalendar} className="underline">
            캘린더 다시 연결
          </button>
        </div>
      )}

      {!cal.dedicatedUnavailable && <ManualForm onCreated={reload} />}

      <FlightList flights={cal.flights} onDeleted={reload} />

      <button onClick={connectCalendar} className="text-xs text-gray-400 underline">
        캘린더 다시 연결
      </button>
    </div>
  );
}

function ManualForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({ flightNumber: '', from: '', to: '', departure: '', arrival: '' });

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!form.flightNumber.trim() || !form.departure) {
      setErr('편명과 출발시각은 필수입니다.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErr(data.error === 'needs_reconnect' ? '캘린더 쓰기 권한이 필요합니다. 다시 연결해 주세요.' : '등록에 실패했습니다.');
        return;
      }
      setForm({ flightNumber: '', from: '', to: '', departure: '', arrival: '' });
      setOpen(false);
      onCreated();
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="inline-flex h-10 items-center rounded border px-4 text-sm">
        + 항공편 직접 등록
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded border bg-white p-4 text-sm">
      <p className="font-medium">항공편 직접 등록</p>
      <div className="grid grid-cols-2 gap-2">
        <input className="col-span-2 h-10 rounded border px-3" placeholder="편명 (예: OZ8995)" value={form.flightNumber} onChange={(e) => set('flightNumber', e.target.value)} />
        <input className="h-10 rounded border px-3" placeholder="출발지 (예: 김포)" value={form.from} onChange={(e) => set('from', e.target.value)} />
        <input className="h-10 rounded border px-3" placeholder="도착지 (예: 제주)" value={form.to} onChange={(e) => set('to', e.target.value)} />
        <label className="text-xs text-gray-500">
          출발
          <input type="datetime-local" className="mt-1 h-10 w-full rounded border px-3" value={form.departure} onChange={(e) => set('departure', e.target.value)} />
        </label>
        <label className="text-xs text-gray-500">
          도착
          <input type="datetime-local" className="mt-1 h-10 w-full rounded border px-3" value={form.arrival} onChange={(e) => set('arrival', e.target.value)} />
        </label>
      </div>
      {err && <p className="text-red-600">{err}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="h-10 rounded bg-blue-600 px-4 text-white disabled:opacity-50">
          {saving ? '저장 중...' : '캘린더에 저장'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="h-10 rounded border px-4">
          취소
        </button>
      </div>
    </form>
  );
}

function FlightList({ flights, onDeleted }: { flights: ParsedFlight[]; onDeleted: () => void }) {
  if (flights.length === 0) {
    return (
      <div className="rounded border bg-white p-4 text-sm text-gray-500">
        항공편이 없습니다. 위에서 직접 등록하거나, 항공권 예약메일이 구글 캘린더에 반영되면 자동으로 나타납니다.
      </div>
    );
  }

  const now = new Date().toISOString();
  const upcoming = flights.filter((f) => (f.departure ?? '') >= now);
  const past = flights.filter((f) => (f.departure ?? '') < now);

  return (
    <div className="space-y-5">
      <FlightSection title="예정된 항공편" flights={upcoming} onDeleted={onDeleted} />
      <FlightSection title="지난 항공편" flights={past} onDeleted={onDeleted} />
    </div>
  );
}

function FlightSection({
  title,
  flights,
  onDeleted,
}: {
  title: string;
  flights: ParsedFlight[];
  onDeleted: () => void;
}) {
  if (flights.length === 0) return null;
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-gray-700">{title}</h2>
      <ul className="space-y-2">
        {flights.map((f) => (
          <FlightItem key={f.id} f={f} onDeleted={onDeleted} />
        ))}
      </ul>
    </section>
  );
}

function FlightItem({ f, onDeleted }: { f: ParsedFlight; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false);

  async function del() {
    if (!f.calendarId) return;
    if (!confirm('이 항공편을 삭제할까요? (구글 캘린더에서도 삭제됩니다)')) return;
    setDeleting(true);
    try {
      const params = new URLSearchParams({ calendarId: f.calendarId, eventId: f.id });
      const res = await fetch(`/api/flights?${params.toString()}`, { method: 'DELETE' });
      if (res.ok) onDeleted();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <li className="rounded border bg-white p-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium">{f.title}</span>
        <div className="flex items-center gap-2">
          {f.source === 'manual' && (
            <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600">직접 등록</span>
          )}
          {f.flightNumber && (
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{f.flightNumber}</span>
          )}
        </div>
      </div>
      {(f.from || f.to) && (
        <p className="mt-1 text-gray-500">
          {[f.from, f.to].filter(Boolean).join(' → ')}
        </p>
      )}
      <p className="mt-1 text-xs text-gray-400">
        {formatDate(f.departure)} {f.arrival ? `~ ${formatDate(f.arrival)}` : ''}
        {f.confidence === 'low' && ' · 자동 인식(확인 필요)'}
      </p>
      {f.source === 'manual' && f.calendarId && (
        <button onClick={del} disabled={deleting} className="mt-2 text-xs text-red-500 underline disabled:opacity-50">
          {deleting ? '삭제 중...' : '삭제'}
        </button>
      )}
    </li>
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
