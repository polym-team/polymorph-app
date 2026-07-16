'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const OAUTH =
  process.env.NEXT_PUBLIC_OAUTH_SERVER_URL || 'https://oauth.polymorph.co.kr';

type Snapshot = {
  id: string;
  urlKey: string;
  html: string;
  createdByName: string;
  updatedAt: string;
};

function login(returnTo: string) {
  const redirect = `${location.origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`;
  location.href = `${OAUTH}/login?clientId=direct-feedback&redirectUri=${encodeURIComponent(redirect)}`;
}

export default function ToBePreview() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(true);
  const [snap, setSnap] = useState<Snapshot | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await fetch(`/api/snapshots/${id}`);
      if (res.status === 401) {
        setAuthed(false);
        setLoading(false);
        return;
      }
      const d = await res.json();
      setSnap(d.snapshot || null);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <main style={S.msg}>로딩 중…</main>;

  if (!authed)
    return (
      <main style={S.msg}>
        <p>To-Be 스냅샷을 보려면 로그인하세요.</p>
        <button style={S.primary} onClick={() => login(`/tobe/${id}`)}>
          로그인
        </button>
      </main>
    );

  if (!snap) return <main style={S.msg}>스냅샷을 찾을 수 없습니다.</main>;

  return (
    <div style={S.wrap}>
      <header style={S.head}>
        <div>
          <strong>To-Be 프리뷰</strong>
          <span style={S.muted}> · {snap.urlKey}</span>
        </div>
        <span style={S.muted}>
          캡처: {snap.createdByName} · {new Date(snap.updatedAt).toLocaleString('ko-KR')}
        </span>
      </header>
      <iframe title="tobe-preview" style={S.frame} sandbox="" srcDoc={docFor(snap.html)} />
    </div>
  );
}

// 신규 스냅샷은 완전한 HTML 문서. (구버전 조각은 감싸서 렌더)
function docFor(html: string): string {
  if (/^\s*<(!doctype|html)/i.test(html)) return html;
  return `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;padding:16px;background:#fff}</style></head><body>${html}</body></html>`;
}

const S: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' },
  head: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '10px 16px', borderBottom: '1px solid #e5e7eb', background: '#f8fafc', fontSize: 14 },
  muted: { color: '#6b7280', fontSize: 13 },
  frame: { flex: 1, width: '100%', border: 0, background: '#f1f5f9' },
  msg: { padding: 24, fontFamily: 'sans-serif', color: '#1a1a1a' },
  primary: { background: '#1e84ff', color: '#fff', border: 0, borderRadius: 6, padding: '8px 14px', fontWeight: 600, cursor: 'pointer', marginTop: 8 },
};
