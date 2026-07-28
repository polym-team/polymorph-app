'use client';

import { useCallback, useEffect, useState } from 'react';
import { CHROME_EXTENSION_URL } from '@/lib/constants';

const OAUTH =
  process.env.NEXT_PUBLIC_OAUTH_SERVER_URL || 'https://oauth.polymorph.co.kr';

type Group = { id: string; name: string };
type Snapshot = {
  id: string;
  urlKey: string;
  status: 'OPEN' | 'RESOLVED';
  createdByName: string;
  resolvedByName: string | null;
  updatedAt: string;
  group?: { name: string };
};

function login(returnTo: string) {
  const redirect = `${location.origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`;
  location.href = `${OAUTH}/login?clientId=direct-feedback&redirectUri=${encodeURIComponent(redirect)}`;
}

/** 초기 필터를 URL querystring 에서 읽는다(공유 링크 지원). SSR 에선 null. */
function readParam(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(key);
}

const STATUS_LABEL: Record<Snapshot['status'], string> = {
  OPEN: '진행 중',
  RESOLVED: '완료',
};

export default function SnapshotsPage() {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [status, setStatus] = useState<'all' | 'open' | 'resolved'>(() => {
    const v = readParam('status');
    return v === 'open' || v === 'resolved' ? v : 'all';
  });
  const [groupId, setGroupId] = useState<string>(() => readParam('group') || '');

  // 선택된 필터를 URL querystring 에 반영 — 링크째로 공유하면 필터도 전달됨
  useEffect(() => {
    const qs = new URLSearchParams();
    qs.set('status', status);
    if (groupId) qs.set('group', groupId);
    window.history.replaceState(null, '', `${window.location.pathname}?${qs.toString()}`);
  }, [status, groupId]);

  const load = useCallback(async () => {
    const qs = new URLSearchParams({ status });
    if (groupId) qs.set('groupId', groupId);
    const res = await fetch(`/api/snapshots/feed?${qs.toString()}`);
    if (res.status === 401) {
      setAuthed(false);
      setLoading(false);
      return;
    }
    const d = await res.json();
    setSnapshots(d.snapshots || []);
    setAuthed(true);
    setLoading(false);
  }, [status, groupId]);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/groups');
      if (res.status === 401) return;
      const d = await res.json();
      setGroups((d.groups || []).map((g: Group) => ({ id: g.id, name: g.name })));
    })();
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function del(id: string) {
    if (!confirm('이 To-Be 스냅샷을 삭제할까요? (되돌릴 수 없습니다)')) return;
    const res = await fetch(`/api/snapshots/${id}`, { method: 'DELETE' });
    if (!res.ok) alert((await res.json().catch(() => ({}))).error || '삭제 실패');
    load();
  }

  if (loading) return <main style={S.main}>로딩 중…</main>;

  if (!authed)
    return (
      <main style={S.main}>
        <h1>DirectFeedback — 스냅샷</h1>
        <p style={S.muted}>To-Be 스냅샷을 관리하려면 로그인하세요.</p>
        <button style={S.primary} onClick={() => login('/snapshots')}>
          로그인
        </button>
      </main>
    );

  return (
    <main style={S.main}>
      <h1>To-Be 스냅샷</h1>
      <p style={S.muted}>
        내가 속한 그룹의 To-Be 스냅샷을 모아 봅니다. 편집기를 열거나 잘못 찍은 스냅샷을 삭제할 수 있습니다. ·{' '}
        <a href="/my" style={S.topLink}>코멘트</a>
        {' · '}
        <a href={CHROME_EXTENSION_URL} style={S.topLink} target="_blank" rel="noreferrer">
          크롬 확장 설치 ↗
        </a>
      </p>

      <div style={S.filters}>
        <div style={S.tabs}>
          {(['all', 'open', 'resolved'] as const).map((s) => (
            <button key={s} style={s === status ? S.tabOn : S.tab} onClick={() => setStatus(s)}>
              {s === 'all' ? '전체' : s === 'open' ? '진행 중' : '완료'}
            </button>
          ))}
        </div>
        <select style={S.select} value={groupId} onChange={(e) => setGroupId(e.target.value)}>
          <option value="">모든 그룹</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {snapshots.length === 0 && <p style={S.muted}>조건에 맞는 스냅샷이 없습니다.</p>}

      {snapshots.map((s) => (
        <section key={s.id} style={S.card}>
          <div style={S.cardHead}>
            <span style={s.status === 'RESOLVED' ? S.badgeDone : S.badgeOpen}>
              {STATUS_LABEL[s.status]}
            </span>
            <span style={S.muted}>
              {s.group?.name} ·{' '}
              {s.status === 'RESOLVED' && s.resolvedByName ? `완료: ${s.resolvedByName}` : s.createdByName}
              {' · '}
              {new Date(s.updatedAt).toLocaleString('ko-KR')}
            </span>
          </div>

          <div style={S.metaRow}>
            <span style={S.tag}>스토리</span>
            <span style={S.urlKey}>{s.urlKey}</span>
          </div>

          <div style={S.actions}>
            <a style={S.openLink} href={`/tobe/${s.id}`} target="_blank" rel="noreferrer">
              편집기 열기 ↗
            </a>
            <button style={S.dangerSm} onClick={() => del(s.id)}>
              삭제
            </button>
          </div>
        </section>
      ))}
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  main: { padding: 24, fontFamily: 'sans-serif', maxWidth: 760, margin: '0 auto', color: '#1a1a1a' },
  muted: { color: '#6b7280', fontSize: 13 },
  topLink: { color: '#1e84ff', textDecoration: 'none', fontWeight: 600 },
  filters: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', margin: '16px 0' },
  tabs: { display: 'inline-flex', border: '1px solid #d0d5dd', borderRadius: 8, overflow: 'hidden' },
  tab: { background: '#fff', color: '#374151', border: 0, padding: '6px 12px', cursor: 'pointer', fontSize: 13 },
  tabOn: { background: '#1e84ff', color: '#fff', border: 0, padding: '6px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  select: { padding: '6px 10px', border: '1px solid #d0d5dd', borderRadius: 8, font: 'inherit' },
  card: { border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginTop: 12 },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 8 },
  metaRow: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', fontSize: 12 },
  tag: { background: '#f1f5f9', color: '#475569', borderRadius: 4, padding: '2px 6px' },
  urlKey: { color: '#6b7280', font: '12px ui-monospace, monospace' },
  actions: { display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' },
  openLink: { color: '#1e84ff', textDecoration: 'none', fontWeight: 600, fontSize: 13, border: '1px solid #1e84ff', borderRadius: 6, padding: '5px 12px' },
  dangerSm: { background: 'transparent', color: '#e5484d', border: '1px solid #f2b8ba', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 13 },
  primary: { background: '#1e84ff', color: '#fff', border: 0, borderRadius: 6, padding: '8px 14px', fontWeight: 600, cursor: 'pointer' },
  badgeOpen: { background: '#e0efff', color: '#1e6fd0', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600 },
  badgeDone: { background: '#e7f6ec', color: '#1a7f43', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600 },
};
