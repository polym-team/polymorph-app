'use client';

import { useCallback, useEffect, useState } from 'react';

const OAUTH =
  process.env.NEXT_PUBLIC_OAUTH_SERVER_URL || 'https://oauth.polymorph.co.kr';

type Group = { id: string; name: string };
type Comment = {
  id: string;
  groupId: string;
  pageUrl: string | null;
  urlKey: string;
  cssPath: string | null;
  tagName: string | null;
  body: string;
  status: 'OPEN' | 'RESOLVED';
  authorName: string;
  createdAt: string;
  group?: { name: string };
  _count?: { replies: number };
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

export default function MyComments() {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [status, setStatus] = useState<'all' | 'open' | 'resolved'>(() => {
    const v = readParam('status');
    return v === 'all' || v === 'resolved' || v === 'open' ? v : 'open';
  });
  const [author, setAuthor] = useState<'me' | 'all'>(() =>
    readParam('author') === 'all' ? 'all' : 'me',
  );
  const [groupId, setGroupId] = useState<string>(() => readParam('group') || '');

  // 선택된 필터를 URL querystring 에 반영(replace) — 링크째로 공유하면 필터도 전달됨
  useEffect(() => {
    const qs = new URLSearchParams();
    qs.set('status', status);
    qs.set('author', author);
    if (groupId) qs.set('group', groupId);
    window.history.replaceState(null, '', `${window.location.pathname}?${qs.toString()}`);
  }, [status, author, groupId]);

  const loadComments = useCallback(async () => {
    const qs = new URLSearchParams({ status, author });
    if (groupId) qs.set('groupId', groupId);
    const res = await fetch(`/api/comments/feed?${qs.toString()}`);
    if (res.status === 401) {
      setAuthed(false);
      setLoading(false);
      return;
    }
    const d = await res.json();
    setComments(d.comments || []);
    setAuthed(true);
    setLoading(false);
  }, [status, author, groupId]);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/groups');
      if (res.status === 401) {
        setAuthed(false);
        setLoading(false);
        return;
      }
      const d = await res.json();
      setGroups((d.groups || []).map((g: Group) => ({ id: g.id, name: g.name })));
    })();
  }, []);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  function storyLink(c: Comment): string | null {
    return c.pageUrl || null;
  }

  if (loading) return <main style={S.main}>로딩 중…</main>;

  if (!authed)
    return (
      <main style={S.main}>
        <h1>DirectFeedback — 코멘트</h1>
        <p style={S.muted}>코멘트를 보려면 로그인하세요.</p>
        <button style={S.primary} onClick={() => login('/my')}>
          로그인
        </button>
      </main>
    );

  return (
    <main style={S.main}>
      <h1>코멘트</h1>
      <p style={S.muted}>내가 속한 그룹의 코멘트를 상태·작성자·그룹으로 필터해 봅니다.</p>

      <div style={S.filters}>
        <div style={S.tabs}>
          {(['open', 'resolved', 'all'] as const).map((s) => (
            <button
              key={s}
              style={s === status ? S.tabOn : S.tab}
              onClick={() => setStatus(s)}
            >
              {s === 'open' ? '미해결' : s === 'resolved' ? '해결됨' : '전체'}
            </button>
          ))}
        </div>
        <div style={S.tabs}>
          {(['me', 'all'] as const).map((a) => (
            <button
              key={a}
              style={a === author ? S.tabOn : S.tab}
              onClick={() => setAuthor(a)}
            >
              {a === 'me' ? '내 코멘트' : '전체 작성자'}
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

      {comments.length === 0 && <p style={S.muted}>조건에 맞는 코멘트가 없습니다.</p>}

      {comments.map((c) => {
        const link = storyLink(c);
        return (
          <section key={c.id} style={S.card}>
            <div style={S.cardHead}>
              <span style={c.status === 'RESOLVED' ? S.badgeDone : S.badgeOpen}>
                {c.status === 'RESOLVED' ? '해결됨' : '미해결'}
              </span>
              <span style={S.muted}>
                {c.group?.name} · {c.authorName} · {new Date(c.createdAt).toLocaleString('ko-KR')}
              </span>
            </div>
            <p style={S.body}>{c.body}</p>
            <div style={S.metaRow}>
              <span style={S.tag}>{c.cssPath ? `${c.tagName || 'el'} · 앵커` : '스토리 레벨'}</span>
              <span style={S.muted}>{c.urlKey}</span>
              {link && (
                <a style={S.storyLink} href={link} target="_blank" rel="noreferrer">
                  스토리북 열기 ↗
                </a>
              )}
              {(c._count?.replies ?? 0) > 0 && (
                <span style={S.muted}>답글 {c._count?.replies}</span>
              )}
            </div>
          </section>
        );
      })}
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  main: { padding: 24, fontFamily: 'sans-serif', maxWidth: 720, margin: '0 auto', color: '#1a1a1a' },
  muted: { color: '#6b7280', fontSize: 13 },
  filters: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', margin: '16px 0' },
  tabs: { display: 'inline-flex', border: '1px solid #d0d5dd', borderRadius: 8, overflow: 'hidden' },
  tab: { background: '#fff', color: '#374151', border: 0, padding: '6px 12px', cursor: 'pointer', fontSize: 13 },
  tabOn: { background: '#1e84ff', color: '#fff', border: 0, padding: '6px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  select: { padding: '6px 10px', border: '1px solid #d0d5dd', borderRadius: 8, font: 'inherit' },
  card: { border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginTop: 12 },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 8 },
  body: { margin: '4px 0 10px', whiteSpace: 'pre-wrap', lineHeight: 1.5 },
  metaRow: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', fontSize: 12 },
  tag: { background: '#f1f5f9', color: '#475569', borderRadius: 4, padding: '2px 6px' },
  storyLink: { color: '#1e84ff', textDecoration: 'none', fontWeight: 600 },
  badgeOpen: { background: '#e0efff', color: '#1e6fd0', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600 },
  badgeDone: { background: '#e7f6ec', color: '#1a7f43', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600 },
  primary: { background: '#1e84ff', color: '#fff', border: 0, borderRadius: 6, padding: '8px 14px', fontWeight: 600, cursor: 'pointer' },
};
