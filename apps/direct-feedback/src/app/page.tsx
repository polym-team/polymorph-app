'use client';

import { useEffect, useState } from 'react';
import { CHROME_EXTENSION_URL } from '@/lib/constants';

const OAUTH =
  process.env.NEXT_PUBLIC_OAUTH_SERVER_URL || 'https://oauth.polymorph.co.kr';

type Group = {
  id: string;
  name: string;
  inviteToken: string | null;
  storybookBaseUrl?: string | null;
  _count?: { comments: number; members: number };
};
type Member = { id: string; email: string; role: string; userId: string | null };
type SiteProfile = { id: string; name: string; domainPatterns: string; targetSelectors: string };
type ProfileDraft = { id?: string; name: string; domainPatterns: string; targetSelectors: string };
const EMPTY_DRAFT: ProfileDraft = { name: '', domainPatterns: '', targetSelectors: '' };

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
  const [bases, setBases] = useState<Record<string, string>>({});
  const [savedBase, setSavedBase] = useState('');
  const [profiles, setProfiles] = useState<Record<string, SiteProfile[]>>({});
  const [profileOpen, setProfileOpen] = useState<Record<string, boolean>>({});
  const [pDraft, setPDraft] = useState<Record<string, ProfileDraft>>({});

  useEffect(() => {
    setBases(Object.fromEntries(groups.map((g) => [g.id, g.storybookBaseUrl || ''])));
  }, [groups]);

  async function saveBase(g: Group) {
    await fetch(`/api/groups/${g.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storybookBaseUrl: bases[g.id] || '' }),
    });
    setSavedBase(g.id);
    setTimeout(() => setSavedBase(''), 1500);
    load();
  }

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

  // ── 사이트 프로필(프로덕션 타겟) ─────────────────────────
  async function loadProfiles(id: string) {
    const r = await fetch(`/api/groups/${id}/site-profiles`);
    const d = await r.json();
    setProfiles((m) => ({ ...m, [id]: d.profiles || [] }));
  }
  function toggleProfiles(id: string) {
    setProfileOpen((o) => {
      const next = !o[id];
      if (next && !profiles[id]) loadProfiles(id);
      return { ...o, [id]: next };
    });
  }
  function draftOf(id: string): ProfileDraft {
    return pDraft[id] || EMPTY_DRAFT;
  }
  function setDraft(id: string, patch: Partial<ProfileDraft>) {
    setPDraft((d) => ({ ...d, [id]: { ...(d[id] || EMPTY_DRAFT), ...patch } }));
  }
  async function saveProfile(groupId: string) {
    const draft = draftOf(groupId);
    const name = draft.name.trim();
    const domainPatterns = draft.domainPatterns.trim();
    const targetSelectors = draft.targetSelectors.trim();
    if (!name || !domainPatterns || !targetSelectors) return;
    const body = JSON.stringify({ name, domainPatterns, targetSelectors });
    const res = draft.id
      ? await fetch(`/api/site-profiles/${draft.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body,
        })
      : await fetch(`/api/groups/${groupId}/site-profiles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        });
    if (!res.ok) {
      alert((await res.json().catch(() => ({}))).error || '저장 실패');
      return;
    }
    setPDraft((d) => ({ ...d, [groupId]: EMPTY_DRAFT }));
    loadProfiles(groupId);
  }
  function editProfile(groupId: string, p: SiteProfile) {
    setPDraft((d) => ({
      ...d,
      [groupId]: { id: p.id, name: p.name, domainPatterns: p.domainPatterns, targetSelectors: p.targetSelectors },
    }));
  }
  async function deleteProfile(groupId: string, id: string) {
    if (!confirm('이 사이트 프로필을 삭제할까요?')) return;
    const res = await fetch(`/api/site-profiles/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      alert((await res.json().catch(() => ({}))).error || '삭제 실패');
      return;
    }
    loadProfiles(groupId);
  }

  function inviteUrl(g: Group) {
    return g.inviteToken ? `${location.origin}/?join=${g.inviteToken}` : '';
  }
  async function copyInvite(g: Group) {
    const url = inviteUrl(g);
    if (!url) {
      alert('이 그룹은 초대 링크가 아직 없습니다. 페이지를 새로고침해 주세요.');
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // 클립보드 API 실패 시 폴백 (execCommand)
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch {
        /* 그래도 실패하면 사용자가 input 에서 수동 복사 가능 */
      }
      ta.remove();
    }
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
      <p>
        <a href="/my" style={S.topLink}>내 코멘트</a>
        {' · '}
        <a href="/snapshots" style={S.topLink}>스냅샷 관리</a>
        {' · '}
        <a href="/guide" style={S.topLink}>MCP 연결 가이드 ↗</a>
        {' · '}
        <a href={CHROME_EXTENSION_URL} style={S.topLink} target="_blank" rel="noreferrer">
          크롬 확장 설치 ↗
        </a>
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

          <div style={S.row}>
            <input
              style={{ ...S.input, fontSize: 12 }}
              placeholder="Storybook base URL (예: https://.../index.html) — 스토리 레벨 코멘트 링크용"
              value={bases[g.id] ?? ''}
              onChange={(e) => setBases((b) => ({ ...b, [g.id]: e.target.value }))}
            />
            <button style={S.ghost} onClick={() => saveBase(g)}>
              {savedBase === g.id ? '저장됨 ✓' : '저장'}
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

          <div style={{ marginTop: 6 }}>
            <button style={S.link} onClick={() => toggleProfiles(g.id)}>
              {profileOpen[g.id] ? '사이트 프로필 닫기' : '사이트 프로필 (프로덕션 타겟)'}
            </button>
          </div>
          {profileOpen[g.id] && (
            <div style={S.profileBox}>
              <p style={S.profileHint}>
                스토리북이 아닌 실제 서비스에서 코멘트/스냅샷 대상을 한정합니다. 도메인과 CSS 선택자를 등록하세요.
              </p>
              {(profiles[g.id] || []).map((p) => (
                <div key={p.id} style={S.profileRow}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={S.profileName}>{p.name}</div>
                    <div style={S.profileMeta}>{p.domainPatterns}</div>
                    <div style={S.profileSel}>
                      {p.targetSelectors.split('\n').filter(Boolean).join('  ,  ')}
                    </div>
                  </div>
                  <button style={S.link} onClick={() => editProfile(g.id, p)}>수정</button>
                  <button style={S.linkDanger} onClick={() => deleteProfile(g.id, p.id)}>삭제</button>
                </div>
              ))}
              {(profiles[g.id]?.length ?? 0) === 0 && <p style={S.muted}>아직 프로필이 없습니다.</p>}

              <div style={S.profileForm}>
                <input
                  style={{ ...S.input, fontSize: 12 }}
                  placeholder="이름 (예: Daum PC)"
                  value={draftOf(g.id).name}
                  onChange={(e) => setDraft(g.id, { name: e.target.value })}
                />
                <input
                  style={{ ...S.input, fontSize: 12 }}
                  placeholder="도메인 (콤마 구분: v.daum.net,*.daum.net)"
                  value={draftOf(g.id).domainPatterns}
                  onChange={(e) => setDraft(g.id, { domainPatterns: e.target.value })}
                />
                <textarea
                  style={S.profileTextarea}
                  spellCheck={false}
                  placeholder={'CSS 선택자 (줄바꿈으로 여러 개)\n[class*="daum-ui-"]'}
                  value={draftOf(g.id).targetSelectors}
                  onChange={(e) => setDraft(g.id, { targetSelectors: e.target.value })}
                />
                <div style={S.row}>
                  <button style={S.primary} onClick={() => saveProfile(g.id)}>
                    {draftOf(g.id).id ? '저장' : '추가'}
                  </button>
                  {draftOf(g.id).id && (
                    <button style={S.ghost} onClick={() => setPDraft((d) => ({ ...d, [g.id]: EMPTY_DRAFT }))}>
                      취소
                    </button>
                  )}
                </div>
              </div>
            </div>
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
  topLink: { color: '#1e84ff', fontSize: 13, textDecoration: 'none', fontWeight: 600 },
  card: { border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginTop: 12 },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  members: { margin: '8px 0 0', paddingLeft: 18, fontSize: 13, color: '#374151' },
  linkDanger: { background: 'none', border: 0, color: '#e5484d', cursor: 'pointer', padding: 0, fontSize: 12, textDecoration: 'underline' },
  profileBox: { marginTop: 8, padding: 10, border: '1px solid #eef1f4', borderRadius: 6, background: '#fafbfc' },
  profileHint: { fontSize: 12, color: '#6b7280', margin: '0 0 8px' },
  profileRow: { display: 'flex', gap: 8, alignItems: 'flex-start', padding: '6px 0', borderTop: '1px solid #f0f0f0' },
  profileName: { fontSize: 13, fontWeight: 600, color: '#1a1a1a' },
  profileMeta: { fontSize: 12, color: '#1e6fd0', marginTop: 2 },
  profileSel: { font: '11px ui-monospace, monospace', color: '#64748b', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  profileForm: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 },
  profileTextarea: { width: '100%', minHeight: 56, boxSizing: 'border-box', border: '1px solid #d0d5dd', borderRadius: 6, padding: 8, font: '12px ui-monospace, monospace', resize: 'vertical' },
};
