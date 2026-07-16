'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { rebuildIntoSandboxedIframe, createCache, createMirror } from 'rrweb-snapshot';

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
  const [deleted, setDeleted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  async function del() {
    if (!confirm('이 To-Be 스냅샷을 삭제할까요?')) return;
    const res = await fetch(`/api/snapshots/${id}`, { method: 'DELETE' });
    if (res.ok) setDeleted(true);
    else alert((await res.json().catch(() => ({}))).error || '삭제 실패');
  }

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

  // rrweb JSON 이면 sandbox iframe 으로 rebuild, 아니면(구버전 HTML) srcdoc 폴백.
  useEffect(() => {
    const root = containerRef.current;
    if (!snap || !root) return;
    root.innerHTML = '';

    let node: unknown = null;
    try {
      node = JSON.parse(snap.html);
    } catch {
      node = null;
    }

    if (node && typeof node === 'object' && 'type' in (node as object)) {
      rebuildIntoSandboxedIframe(node as Parameters<typeof rebuildIntoSandboxedIframe>[0], {
        root,
        cache: createCache(),
        mirror: createMirror(),
        iframeAttributes: { style: 'width:100%;height:100%;border:0;background:#fff' },
      });
    } else {
      const iframe = document.createElement('iframe');
      iframe.setAttribute('sandbox', '');
      iframe.style.cssText = 'width:100%;height:100%;border:0;background:#fff';
      iframe.srcdoc = /^\s*<(!doctype|html)/i.test(snap.html)
        ? snap.html
        : `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;padding:16px}</style></head><body>${snap.html}</body></html>`;
      root.appendChild(iframe);
    }
  }, [snap]);

  if (deleted) return <main style={S.msg}>스냅샷을 삭제했습니다. 이 창을 닫으셔도 됩니다.</main>;

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
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={S.muted}>
            캡처: {snap.createdByName} · {new Date(snap.updatedAt).toLocaleString('ko-KR')}
          </span>
          <button style={S.danger} onClick={del}>
            삭제
          </button>
        </div>
      </header>
      <div ref={containerRef} style={S.frame} />
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' },
  head: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '10px 16px', borderBottom: '1px solid #e5e7eb', background: '#f8fafc', fontSize: 14 },
  muted: { color: '#6b7280', fontSize: 13 },
  frame: { flex: 1, width: '100%', background: '#f1f5f9', overflow: 'hidden' },
  msg: { padding: 24, fontFamily: 'sans-serif', color: '#1a1a1a' },
  primary: { background: '#1e84ff', color: '#fff', border: 0, borderRadius: 6, padding: '8px 14px', fontWeight: 600, cursor: 'pointer', marginTop: 8 },
  danger: { background: 'transparent', color: '#e5484d', border: '1px solid #f2b8ba', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 13 },
};
