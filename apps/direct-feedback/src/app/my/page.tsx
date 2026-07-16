'use client';

import { useCallback, useEffect, useState } from 'react';

const OAUTH =
  process.env.NEXT_PUBLIC_OAUTH_SERVER_URL || 'https://oauth.polymorph.co.kr';

type Group = { id: string; name: string; storybookBaseUrl?: string | null };
type Reply = { id: string; body: string; authorName: string; createdAt: string };
type Comment = {
  id: string;
  groupId: string;
  pageUrl: string | null;
  urlKey: string;
  cssPath: string | null;
  tagName: string | null;
  body: string;
  status: 'OPEN' | 'RESOLVED' | 'REJECTED';
  authorId: string;
  authorName: string;
  createdAt: string;
  group?: { name: string; storybookBaseUrl?: string | null };
  replies?: Reply[];
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

const STATUS_LABEL: Record<Comment['status'], string> = {
  OPEN: '미해결',
  RESOLVED: '해결됨',
  REJECTED: '반려',
};

export default function MyComments() {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [meId, setMeId] = useState('');
  const [status, setStatus] = useState<'all' | 'open' | 'resolved' | 'rejected'>(() => {
    const v = readParam('status');
    return v === 'all' || v === 'resolved' || v === 'rejected' || v === 'open' ? v : 'open';
  });
  const [author, setAuthor] = useState<'me' | 'all'>(() =>
    readParam('author') === 'all' ? 'all' : 'me',
  );
  const [groupId, setGroupId] = useState<string>(() => readParam('group') || '');

  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [editId, setEditId] = useState<string>('');
  const [editText, setEditText] = useState('');

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
    setMeId(d.meId || '');
    setAuthed(true);
    setLoading(false);
  }, [status, author, groupId]);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/groups');
      if (res.status === 401) return;
      const d = await res.json();
      setGroups((d.groups || []).map((g: Group) => ({ id: g.id, name: g.name })));
    })();
  }, []);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // 정확한 pageUrl(작성 시점 그 빌드) 우선, 없으면 그룹 base + 스토리 경로
  function storyLink(c: Comment): string | null {
    if (c.pageUrl) return c.pageUrl;
    const base = c.group?.storybookBaseUrl;
    if (!base) return null;
    const kind = c.urlKey.endsWith('--docs') ? 'docs' : 'story';
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}path=/${kind}/${c.urlKey}`;
  }

  async function changeStatus(id: string, next: Comment['status']) {
    const res = await fetch(`/api/comments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) alert((await res.json()).error || '상태 변경 실패');
    loadComments();
  }

  async function del(id: string) {
    if (!confirm('이 코멘트를 삭제할까요?')) return;
    const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
    if (!res.ok) alert((await res.json()).error || '삭제 실패');
    loadComments();
  }

  async function saveEdit(id: string) {
    const body = editText.trim();
    if (!body) return;
    const res = await fetch(`/api/comments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
    if (!res.ok) alert((await res.json()).error || '수정 실패');
    setEditId('');
    loadComments();
  }

  async function sendReply(id: string) {
    const body = (replyDraft[id] || '').trim();
    if (!body) return;
    const res = await fetch(`/api/comments/${id}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
    if (!res.ok) alert((await res.json()).error || '답글 실패');
    setReplyDraft((d) => ({ ...d, [id]: '' }));
    loadComments();
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
      <p style={S.muted}>
        내가 속한 그룹의 코멘트를 상태·작성자·그룹으로 필터해 봅니다. ·{' '}
        <a href="/guide" style={{ color: '#1e84ff', textDecoration: 'none', fontWeight: 600 }}>
          MCP 연결 가이드 ↗
        </a>
      </p>

      <div style={S.filters}>
        <div style={S.tabs}>
          {(['open', 'resolved', 'rejected', 'all'] as const).map((s) => (
            <button key={s} style={s === status ? S.tabOn : S.tab} onClick={() => setStatus(s)}>
              {s === 'open' ? '미해결' : s === 'resolved' ? '해결됨' : s === 'rejected' ? '반려' : '전체'}
            </button>
          ))}
        </div>
        <div style={S.tabs}>
          {(['me', 'all'] as const).map((a) => (
            <button key={a} style={a === author ? S.tabOn : S.tab} onClick={() => setAuthor(a)}>
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
        const mine = c.authorId === meId;
        const badge =
          c.status === 'RESOLVED' ? S.badgeDone : c.status === 'REJECTED' ? S.badgeRej : S.badgeOpen;
        return (
          <section key={c.id} style={S.card}>
            <div style={S.cardHead}>
              <span style={badge}>{STATUS_LABEL[c.status]}</span>
              <span style={S.muted}>
                {c.group?.name} · {c.authorName} · {new Date(c.createdAt).toLocaleString('ko-KR')}
              </span>
            </div>

            {editId === c.id ? (
              <div>
                <textarea style={S.textarea} value={editText} onChange={(e) => setEditText(e.target.value)} />
                <div style={S.actions}>
                  <button style={S.primarySm} onClick={() => saveEdit(c.id)}>저장</button>
                  <button style={S.ghostSm} onClick={() => setEditId('')}>취소</button>
                </div>
              </div>
            ) : (
              <p style={S.body}>{c.body}</p>
            )}

            <div style={S.metaRow}>
              <span style={S.tag}>{c.cssPath ? `${c.tagName || 'el'} · 앵커` : '스토리 레벨'}</span>
              <span style={S.muted}>{c.urlKey}</span>
              {link && (
                <a style={S.storyLink} href={link} target="_blank" rel="noreferrer">
                  스토리북 열기 ↗
                </a>
              )}
            </div>

            {/* 답글 */}
            {(c.replies?.length ?? 0) > 0 && (
              <ul style={S.replies}>
                {c.replies!.map((r) => (
                  <li key={r.id} style={S.reply}>
                    <span style={S.replyMeta}>{r.authorName}</span> {r.body}
                  </li>
                ))}
              </ul>
            )}
            <div style={S.replyRow}>
              <input
                style={S.replyInput}
                placeholder="답글 달기…"
                value={replyDraft[c.id] || ''}
                onChange={(e) => setReplyDraft((d) => ({ ...d, [c.id]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && sendReply(c.id)}
              />
              <button style={S.ghostSm} onClick={() => sendReply(c.id)}>등록</button>
            </div>

            {/* 액션: 작성자=수정/삭제, 비작성자=상태 변경 */}
            <div style={S.actions}>
              {mine ? (
                <>
                  {editId !== c.id && (
                    <button
                      style={S.ghostSm}
                      onClick={() => {
                        setEditId(c.id);
                        setEditText(c.body);
                      }}
                    >
                      수정
                    </button>
                  )}
                  <button style={S.dangerSm} onClick={() => del(c.id)}>삭제</button>
                </>
              ) : (
                <>
                  {c.status !== 'RESOLVED' && (
                    <button style={S.doneSm} onClick={() => changeStatus(c.id, 'RESOLVED')}>해결</button>
                  )}
                  {c.status !== 'REJECTED' && (
                    <button style={S.rejSm} onClick={() => changeStatus(c.id, 'REJECTED')}>반려</button>
                  )}
                  {c.status !== 'OPEN' && (
                    <button style={S.ghostSm} onClick={() => changeStatus(c.id, 'OPEN')}>열기</button>
                  )}
                </>
              )}
            </div>
          </section>
        );
      })}
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  main: { padding: 24, fontFamily: 'sans-serif', maxWidth: 760, margin: '0 auto', color: '#1a1a1a' },
  muted: { color: '#6b7280', fontSize: 13 },
  filters: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', margin: '16px 0' },
  tabs: { display: 'inline-flex', border: '1px solid #d0d5dd', borderRadius: 8, overflow: 'hidden' },
  tab: { background: '#fff', color: '#374151', border: 0, padding: '6px 12px', cursor: 'pointer', fontSize: 13 },
  tabOn: { background: '#1e84ff', color: '#fff', border: 0, padding: '6px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  select: { padding: '6px 10px', border: '1px solid #d0d5dd', borderRadius: 8, font: 'inherit' },
  card: { border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginTop: 12 },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 8 },
  body: { margin: '4px 0 10px', whiteSpace: 'pre-wrap', lineHeight: 1.5 },
  textarea: { width: '100%', minHeight: 72, boxSizing: 'border-box', border: '1px solid #d0d5dd', borderRadius: 6, padding: 8, font: 'inherit', resize: 'vertical' },
  metaRow: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', fontSize: 12 },
  tag: { background: '#f1f5f9', color: '#475569', borderRadius: 4, padding: '2px 6px' },
  storyLink: { color: '#1e84ff', textDecoration: 'none', fontWeight: 600 },
  replies: { margin: '10px 0 0', padding: '8px 0 0 12px', listStyle: 'none', borderTop: '1px solid #f0f0f0' },
  reply: { fontSize: 13, padding: '4px 0', color: '#374151' },
  replyMeta: { color: '#8b95a1', fontSize: 12, marginRight: 4 },
  replyRow: { display: 'flex', gap: 8, marginTop: 8 },
  replyInput: { flex: 1, padding: 6, border: '1px solid #d0d5dd', borderRadius: 6, font: 'inherit', fontSize: 13 },
  actions: { display: 'flex', gap: 8, marginTop: 10 },
  primary: { background: '#1e84ff', color: '#fff', border: 0, borderRadius: 6, padding: '8px 14px', fontWeight: 600, cursor: 'pointer' },
  primarySm: { background: '#1e84ff', color: '#fff', border: 0, borderRadius: 6, padding: '5px 12px', fontWeight: 600, cursor: 'pointer', fontSize: 13 },
  ghostSm: { background: 'transparent', color: '#6b7280', border: '1px solid #d0d5dd', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 13 },
  doneSm: { background: '#e7f6ec', color: '#1a7f43', border: '1px solid #b7e4c7', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  rejSm: { background: '#fdecec', color: '#c0392b', border: '1px solid #f5c6c6', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  dangerSm: { background: 'transparent', color: '#e5484d', border: '1px solid #f2b8ba', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 13 },
  badgeOpen: { background: '#e0efff', color: '#1e6fd0', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600 },
  badgeDone: { background: '#e7f6ec', color: '#1a7f43', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600 },
  badgeRej: { background: '#fdecec', color: '#c0392b', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600 },
};
