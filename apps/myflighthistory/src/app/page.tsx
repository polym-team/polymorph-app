'use client';

import { useCallback, useEffect, useState } from 'react';
import { CLIENT_ID, OAUTH_SERVER_URL } from '@/lib/oauth';
import { airlineName } from '@/lib/prediction';
import type { ParsedFlight } from '@/lib/flightParser';
import { SplitFlap } from '@/components/SplitFlap';

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
  error: { text: '캘린더 연결 중 오류가 발생했습니다.', tone: 'warn' },
  login_required: { text: '먼저 로그인이 필요합니다.', tone: 'warn' },
};

function connectCalendar() {
  const returnUrl = `${window.location.origin}/`;
  window.location.href =
    `${OAUTH_SERVER_URL}/api/connect/google-calendar` +
    `?clientId=${CLIENT_ID}&returnUrl=${encodeURIComponent(returnUrl)}`;
}

/* ---- 시각/날짜 포맷 (KST) ---- */
function hhmm(iso: string | null): string {
  if (!iso) return '--:--';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '--:--';
  return d.toLocaleTimeString('ko-KR', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Seoul',
  });
}
function md(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('ko-KR', {
    month: '2-digit', day: '2-digit', weekday: 'short', timeZone: 'Asia/Seoul',
  });
}

/* ---- ParsedFlight → 현황 뷰모델 ---- */
type StatusView = {
  kind: 'live' | 'pred' | 'none';
  label: string;
  colorClass: string;
  min: string | null;
  remark: string | null;
  est: string | null;
  sevColor: string | null;
};
const SEV_COLOR: Record<string, string> = {
  ontime: 'var(--ontime)', delay: 'var(--delay)', cancel: 'var(--cancel)', none: 'var(--fids-label)',
};
const LIVE_LABEL: Record<string, [string, string]> = {
  ontime: ['정시', 'st-ontime'],
  scheduled: ['정시예정', 'st-ontime'],
  departed: ['출발', 'st-moved'],
  arrived: ['도착', 'st-moved'],
  delayed: ['지연', 'st-delay'],
  cancelled: ['결항', 'st-cancel'],
  unknown: ['확인', 'st-pred'],
};

function statusView(f: ParsedFlight): StatusView {
  if (f.liveStatus) {
    const s = f.liveStatus;
    const [label, colorClass] = LIVE_LABEL[s.status] ?? LIVE_LABEL.unknown;
    const showMin = s.delayMin != null && s.delayMin >= 15 && s.status !== 'cancelled';
    const est = s.estimatedTime && s.estimatedTime !== s.scheduledTime ? s.estimatedTime : null;
    return { kind: 'live', label, colorClass, min: showMin ? `+${s.delayMin}분` : null, remark: s.remark, est, sevColor: null };
  }
  if (f.prediction) {
    const map: Record<string, [string, string]> = {
      low: ['낮음', 'ontime'], moderate: ['보통', 'delay'], high: ['주의', 'cancel'],
    };
    const [label, sev] = map[f.prediction.level] ?? map.moderate;
    const pct = Math.round(f.prediction.delayProbability * 100);
    const why = f.prediction.basis[0] ?? '';
    return { kind: 'pred', label, colorClass: 'st-pred', min: null, remark: `예측 ${pct}% · ${why}`, est: null, sevColor: SEV_COLOR[sev] };
  }
  return { kind: 'none', label: '기록 없음', colorClass: 'st-pred', min: null, remark: '3일 이전 · 데이터 없음', est: null, sevColor: SEV_COLOR.none };
}

/* ============ page ============ */
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
    <div className="fids">
      <div className="wrap">
        <div className="board">
          <div className="signage">
            <div>
              <div className="name">
                MYFLIGHT<span className="thin">HISTORY</span>
              </div>
              <div className="tagline">내 항공 편성표 · Departures 出發</div>
            </div>
            <Clock />
          </div>

          {banner && (
            <div
              style={{
                marginTop: 14, padding: '10px 14px', borderRadius: 8, fontSize: 12.5,
                fontFamily: 'var(--fids-mono)',
                color: banner.tone === 'ok' ? 'var(--ontime)' : 'var(--delay)',
                background: 'rgba(255,255,255,0.03)', border: '1px solid #000',
              }}
            >
              {banner.text}
            </div>
          )}

          {me === null ? (
            <Loading />
          ) : !me.authenticated ? (
            <LoggedOut />
          ) : (
            <Authed cal={cal} reload={loadFlights} />
          )}
        </div>

        <p className="note">
          실시간 상태는 공공데이터(한국공항공사·인천공항)로 <b>출발 임박(±3~6일)</b> 항공편에 표시됩니다.
          그 밖의 예정편은 노선·시간대·계절 <b>패턴 예측</b>(무채색·심각도 점), 3일 이전 과거편은 데이터가 없어 <b>기록 없음</b>으로 둡니다.
        </p>
      </div>
    </div>
  );
}

function Clock() {
  const [t, setT] = useState('--:--:--');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const kst = new Date(now.getTime() + (now.getTimezoneOffset() + 540) * 60000);
      const p = (n: number) => String(n).padStart(2, '0');
      setT(`${p(kst.getHours())}:${p(kst.getMinutes())}:${p(kst.getSeconds())} KST`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <div className="clock">{t}</div>;
}

function Loading() {
  return <div className="empty">불러오는 중…</div>;
}

function LoggedOut() {
  return (
    <div style={{ marginTop: 16 }} className="panel">
      <div className="p-title">로그인</div>
      <div className="p-sub">내 항공 편성표를 보려면 로그인하세요.</div>
      <a className="btn btn-primary" href="/login">로그인</a>
    </div>
  );
}

function Authed({ cal, reload }: { cal: CalendarResult | null; reload: () => void }) {
  const [tab, setTab] = useState<'up' | 'past'>('up');

  if (cal === null) return <Loading />;

  if (!cal.connected) {
    return (
      <div style={{ marginTop: 16 }} className="panel">
        <div className="p-title">구글 캘린더 연결</div>
        <div className="p-sub">
          {cal.needsReconnect
            ? '연결이 만료되어 다시 연결이 필요합니다.'
            : '캘린더의 항공편을 자동으로 불러오고, 직접 등록한 항공편도 캘린더에 저장합니다.'}
        </div>
        <button className="btn btn-primary" onClick={connectCalendar}>구글 캘린더 연결하기</button>
      </div>
    );
  }

  const now = new Date().toISOString();
  const upcoming = cal.flights.filter((f) => (f.departure ?? '') >= now);
  const past = cal.flights.filter((f) => (f.departure ?? '') < now).reverse();
  const list = tab === 'up' ? upcoming : past;

  return (
    <>
      <div className="tabs" role="tablist">
        <button className="tab" role="tab" aria-selected={tab === 'up'} onClick={() => setTab('up')}>
          예정 <span className="c">{upcoming.length}</span>
        </button>
        <button className="tab" role="tab" aria-selected={tab === 'past'} onClick={() => setTab('past')}>
          지난 <span className="c">{past.length}</span>
        </button>
      </div>

      {tab === 'up' && !cal.dedicatedUnavailable && (
        <div style={{ padding: '4px 4px 10px' }}>
          <ManualForm onCreated={reload} />
        </div>
      )}
      {cal.dedicatedUnavailable && (
        <div style={{ padding: '4px', fontSize: 12, color: 'var(--delay)', fontFamily: 'var(--fids-mono)' }}>
          캘린더 쓰기 권한이 없어 직접 등록이 비활성화됨.{' '}
          <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={connectCalendar}>다시 연결</button>
        </div>
      )}

      <div className="display">
        <div className="colhead">
          <div>편명 / Flight</div>
          <div>목적지 / To</div>
          <div className="r">예정 / Time</div>
          <div className="r">현황 / Remark</div>
        </div>

        {list.length === 0 ? (
          <div className="empty">
            {tab === 'up'
              ? '예정된 항공편이 없습니다. 위에서 직접 등록하거나, 예약메일이 캘린더에 반영되면 나타납니다.'
              : '지난 항공편이 없습니다.'}
          </div>
        ) : (
          list.map((f, i) => (
            <Row key={f.id} f={f} index={i} animate={tab === 'up'} onDeleted={reload} />
          ))
        )}

        <div className="legend">
          <span><i style={{ background: 'var(--ontime)' }} />On time</span>
          <span><i style={{ background: 'var(--delay)' }} />Delayed</span>
          <span><i style={{ background: 'var(--cancel)' }} />Cancelled</span>
          <span><i style={{ background: 'var(--moved)' }} />Departed</span>
          <span><i style={{ background: 'var(--fids-dim)' }} />예측 Forecast</span>
        </div>
      </div>
    </>
  );
}

function Row({
  f, index, animate, onDeleted,
}: {
  f: ParsedFlight; index: number; animate: boolean; onDeleted: () => void;
}) {
  const sv = statusView(f);
  const order = index * 6;

  async function del() {
    if (!f.calendarId) return;
    if (!confirm('이 항공편을 삭제할까요? (구글 캘린더에서도 삭제됩니다)')) return;
    const params = new URLSearchParams({ calendarId: f.calendarId, eventId: f.id });
    const res = await fetch(`/api/flights?${params.toString()}`, { method: 'DELETE' });
    if (res.ok) onDeleted();
  }

  return (
    <div className="row">
      <div className="col-flt">
        <SplitFlap value={f.flightNumber ?? '----'} animate={animate} order={order} />
        <div className="al">{airlineName(f.flightNumber) ?? '—'}</div>
      </div>

      <div className="r-date">{md(f.departure)}</div>

      <div className="col-dest">
        {f.from && <div className="from">{f.from} 발</div>}
        <SplitFlap value={f.to ?? f.flightNumber ?? '—'} animate={animate} order={order} />
        {sv.remark && <div className="remark">{sv.remark}</div>}
        {f.source === 'manual' && f.calendarId && (
          <button
            onClick={del}
            style={{
              marginTop: 8, background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--fids-label)', fontSize: 11, fontFamily: 'var(--fids-mono)',
              textDecoration: 'underline', padding: 0,
            }}
          >
            직접 등록 · 삭제
          </button>
        )}
      </div>

      <div className="col-time">
        {sv.est && <div className="struck">{hhmm(f.departure)}</div>}
        <SplitFlap value={sv.est ?? hhmm(f.departure)} animate={animate} order={order} />
        <div className="date">{md(f.departure)}</div>
      </div>

      <div className="col-status">
        {sv.kind === 'pred' || sv.kind === 'none' ? (
          <>
            <div className="pred-tag">
              <span className="lbl">{sv.kind === 'none' ? '기록' : '예측'}</span>
              <span className="dot" style={{ background: sv.sevColor ?? 'var(--fids-label)' }} />
            </div>
            <div className={sv.colorClass}>
              <SplitFlap value={sv.label} animate={animate} order={order} />
            </div>
          </>
        ) : (
          <div className={sv.colorClass}>
            <SplitFlap value={sv.label} animate={animate} order={order} />
            {sv.min && <div className="min">{sv.min}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

function ManualForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({ flightNumber: '', from: '', to: '', departure: '', arrival: '' });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

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
      <button className="btn btn-ghost" onClick={() => setOpen(true)}>+ 항공편 직접 등록</button>
    );
  }

  const inputStyle = { width: '100%' } as const;
  return (
    <form onSubmit={submit} className="panel" style={{ display: 'grid', gap: 10 }}>
      <div className="p-title">항공편 직접 등록</div>
      <input className="fids-input" style={inputStyle} placeholder="편명 (예: OZ8995)" value={form.flightNumber} onChange={(e) => set('flightNumber', e.target.value)} />
      <div style={{ display: 'flex', gap: 10 }}>
        <input className="fids-input" style={{ flex: 1 }} placeholder="출발지 (예: 김포)" value={form.from} onChange={(e) => set('from', e.target.value)} />
        <input className="fids-input" style={{ flex: 1 }} placeholder="도착지 (예: 제주)" value={form.to} onChange={(e) => set('to', e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <label style={{ flex: 1, fontSize: 11, color: 'var(--fids-label)', fontFamily: 'var(--fids-mono)' }}>
          출발
          <input type="datetime-local" className="fids-input" style={{ ...inputStyle, marginTop: 4 }} value={form.departure} onChange={(e) => set('departure', e.target.value)} />
        </label>
        <label style={{ flex: 1, fontSize: 11, color: 'var(--fids-label)', fontFamily: 'var(--fids-mono)' }}>
          도착
          <input type="datetime-local" className="fids-input" style={{ ...inputStyle, marginTop: 4 }} value={form.arrival} onChange={(e) => set('arrival', e.target.value)} />
        </label>
      </div>
      {err && <div style={{ color: 'var(--cancel)', fontSize: 12 }}>{err}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '저장 중…' : '캘린더에 저장'}</button>
        <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>취소</button>
      </div>
    </form>
  );
}
