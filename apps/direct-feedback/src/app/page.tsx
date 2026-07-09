'use client';

import { useEffect, useState } from 'react';

const OAUTH =
  process.env.NEXT_PUBLIC_OAUTH_SERVER_URL || 'https://oauth.polymorph.co.kr';

type Group = {
  id: string;
  name: string;
  inviteToken: string | null;
  _count?: { comments: number; members: number };
};
type Member = { id: string; email: string; role: string; userId: string | null };

function login(returnTo: string) {
  const redirect = `${location.origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`;
  location.href = `${OAUTH}/login?clientId=direct-feedback&redirectUri=${encodeURIComponent(redirect)}`;
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState('');
  const [members, setMembers] = useState<Record<string, Member[]>>({});
  const [copied, setCopied] = useState('');

  async function load() {
    const res = await fetch('/api/groups');
    if (res.status === 401) {
      setAuthed(false);
      setLoading(false);
      return;
    }
    const d = await res.json();
    setGroups(d.groups || []);
    setAuthed(true);
    setLoading(false);
  }

  useEffect(() => {
    const joinToken = new URLSearchParams(location.search).get('join');
    (async () => {
      if (joinToken) {
        const r = await fetch('/api/groups/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: joinToken }),
        });
        if (r.status === 401) {
          login(location.pathname + location.search);
          return;
        }
        history.replaceState({}, '', '/');
      }
      load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createGroup() {
    if (!name.trim()) return;
    await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });
    setName('');
    load();
  }

  async function loadMembers(id: string) {
    const r = await fetch(`/api/groups/${id}/members`);
    const d = await r.json();
    setMembers((m) => ({ ...m, [id]: d.members || [] }));
  }

  function inviteUrl(g: Group) {
    return g.inviteToken ? `${location.origin}/?join=${g.inviteToken}` : '';
  }
  async function copyInvite(g: Group) {
    const url = inviteUrl(g);
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(g.id);
    setTimeout(() => setCopied(''), 1500);
  }

  if (loading) return <main style={S.main}>로딩 중…</main>;

  if (!authed)
    return (
      <main style={S.main}>
        <h1>DirectFeedback</h1>
        <p style={S.muted}>그룹과 코멘트를 관리하려면 로그인하세요.</p>
        <button style={S.primary} onClick={() => login('/')}>
          로그인
        </button>
      </main>
    );

  return (
    <main style={S.main}>
      <h1>DirectFeedback — 그룹</h1>
      <p style={S.muted}>
        그룹 멤버는 그 그룹의 모든 코멘트를 봅니다. 초대 링크를 공유해 멤버를 추가하세요.
      </p>

      <div style={S.row}>
        <input
          style={S.input}
          placeholder="새 그룹 이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && createGroup()}
        />
        <button style={S.primary} onClick={createGroup}>
          그룹 생성
        </button>
      </div>

      {groups.length === 0 && <p style={S.muted}>아직 그룹이 없습니다.</p>}

      {groups.map((g) => (
        <section key={g.id} style={S.card}>
          <div style={S.cardHead}>
            <strong>{g.name}</strong>
            <span style={S.muted}>
              멤버 {g._count?.members ?? 0} · 코멘트 {g._count?.comments ?? 0}
            </span>
          </div>

          <div style={S.row}>
            <input readOnly style={{ ...S.input, fontSize: 12 }} value={inviteUrl(g)} />
            <button style={S.ghost} onClick={() => copyInvite(g)}>
              {copied === g.id ? '복사됨 ✓' : '초대 링크 복사'}
            </button>
          </div>

          <button style={S.link} onClick={() => loadMembers(g.id)}>
            멤버 보기
          </button>
          {members[g.id] && (
            <ul style={S.members}>
              {members[g.id].map((m) => (
                <li key={m.id}>
                  {m.email} · {m.role}
                  {m.userId ? '' : ' (초대 대기)'}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  main: { padding: 24, fontFamily: 'sans-serif', maxWidth: 640, margin: '0 auto', color: '#1a1a1a' },
  muted: { color: '#6b7280', fontSize: 13 },
  row: { display: 'flex', gap: 8, alignItems: 'center', margin: '8px 0' },
  input: { flex: 1, padding: 8, border: '1px solid #d0d5dd', borderRadius: 6, font: 'inherit' },
  primary: { background: '#1e84ff', color: '#fff', border: 0, borderRadius: 6, padding: '8px 14px', fontWeight: 600, cursor: 'pointer' },
  ghost: { background: 'transparent', color: '#1e84ff', border: '1px solid #1e84ff', borderRadius: 6, padding: '8px 12px', cursor: 'pointer', whiteSpace: 'nowrap' },
  link: { background: 'none', border: 0, color: '#6b7280', cursor: 'pointer', padding: 0, fontSize: 12, textDecoration: 'underline' },
  card: { border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginTop: 12 },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  members: { margin: '8px 0 0', paddingLeft: 18, fontSize: 13, color: '#374151' },
};
