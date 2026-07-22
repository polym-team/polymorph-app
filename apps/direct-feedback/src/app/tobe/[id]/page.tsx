'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { rebuild, snapshot, createCache, createMirror } from 'rrweb-snapshot';
import {
  boxModel,
  gaps,
  visibleParent,
  firstVisibleChild,
  nextVisibleSibling,
  prevVisibleSibling,
} from '@polym-team/element-inspector';

const OAUTH =
  process.env.NEXT_PUBLIC_OAUTH_SERVER_URL || 'https://oauth.polymorph.co.kr';

type Snapshot = {
  id: string;
  urlKey: string;
  html: string;
  status: 'OPEN' | 'RESOLVED';
  createdByName: string;
  updatedAt: string;
};

function login(returnTo: string) {
  const redirect = `${location.origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`;
  location.href = `${OAUTH}/login?clientId=direct-feedback&redirectUri=${encodeURIComponent(redirect)}`;
}

// 편집 참고용 computed CSS 속성(디자이너가 기존 값 보고 오버라이드)
const REF_PROPS = [
  'display', 'width', 'height', 'font-size', 'font-weight', 'line-height', 'letter-spacing',
  'color', 'background-color', 'text-align', 'opacity',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius',
  'gap',
];

function parseNode(html: string): unknown | null {
  try {
    const n = JSON.parse(html);
    return n && typeof n === 'object' && 'type' in n ? n : null;
  } catch {
    return null;
  }
}

export default function ToBeEditor() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(true);
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [deleted, setDeleted] = useState(false);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [sel, setSel] = useState<{ tag: string; css: string; leaf: boolean; text: string } | null>(null);
  const [computed, setComputed] = useState<{ p: string; v: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const idocRef = useRef<Document | null>(null);
  const selElRef = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const editableRef = useRef(false);
  // iframe 내부에 그리는 인스펙터 레이어(hover 아웃라인 + 박스모델/gap). 저장 직전 제거.
  const inspectorRef = useRef<HTMLDivElement | null>(null);
  const hoverElRef = useRef<HTMLDivElement | null>(null);
  const bandElsRef = useRef<HTMLElement[]>([]);
  const scrollRafRef = useRef<number | null>(null);

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

  function positionOverlay() {
    const el = selElRef.current;
    const iframe = iframeRef.current;
    const box = overlayRef.current;
    if (!el || !iframe || !box) return;
    const r = el.getBoundingClientRect();
    const fr = iframe.getBoundingClientRect();
    box.style.display = 'block';
    box.style.left = `${fr.left + r.left}px`;
    box.style.top = `${fr.top + r.top}px`;
    box.style.width = `${r.width}px`;
    box.style.height = `${r.height}px`;
  }

  // ── iframe 내부 인스펙터 레이어(hover 아웃라인 + 박스모델/gap) ──────────
  // 인스펙터 노드인지(순회/hover 에서 제외, 저장 직전 통째로 제거).
  const INSPECTOR_ATTR = 'data-df-inspector';
  function isOurs(el: Element | null): boolean {
    return !!el && !!el.closest?.(`[${INSPECTOR_ATTR}]`);
  }
  function ensureInspector(): HTMLDivElement | null {
    const idoc = idocRef.current;
    if (!idoc) return null;
    const cur = inspectorRef.current;
    if (cur && cur.ownerDocument === idoc && cur.isConnected) return cur;
    const c = idoc.createElement('div');
    c.setAttribute(INSPECTOR_ATTR, '');
    // position:fixed → iframe 뷰포트 기준. 자식은 getBoundingClientRect(뷰포트) 좌표 그대로 사용.
    c.style.cssText =
      'position:fixed;inset:0;margin:0;pointer-events:none;z-index:2147483000';
    (idoc.documentElement || idoc.body).appendChild(c);
    inspectorRef.current = c;
    hoverElRef.current = null;
    bandElsRef.current = [];
    return c;
  }
  function clearBands() {
    bandElsRef.current.forEach((b) => b.remove());
    bandElsRef.current = [];
  }
  function renderInspector(el: HTMLElement) {
    const idoc = idocRef.current;
    const c = ensureInspector();
    if (!idoc || !c) return;
    clearBands();
    const put = (
      left: number, top: number, width: number, height: number,
      bg: string, value: number, labelBg: string,
    ) => {
      const b = idoc.createElement('div');
      b.setAttribute(INSPECTOR_ATTR, '');
      b.style.cssText =
        `position:absolute;left:${left}px;top:${top}px;width:${Math.max(width, 0)}px;` +
        `height:${Math.max(height, 0)}px;background:${bg};box-sizing:border-box;pointer-events:none`;
      if (value >= 1) {
        // 얇은 밴드라 라벨이 밴드 밖으로 넘쳐도 항상 표시 (중앙 정렬, overflow 허용)
        const lbl = idoc.createElement('span');
        lbl.textContent = String(Math.round(value));
        lbl.style.cssText =
          'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);' +
          `font:600 10px/1 ui-monospace,monospace;color:#fff;background:${labelBg};` +
          'padding:1px 3px;border-radius:2px;white-space:nowrap;z-index:1';
        b.appendChild(lbl);
      }
      c.appendChild(b);
      bandElsRef.current.push(b);
    };
    const { padding, margin } = boxModel(el);
    padding.forEach((p) => put(p.left, p.top, p.width, p.height, 'rgba(34,197,94,0.35)', p.value, 'rgba(21,128,61,0.95)'));
    margin.forEach((m) => put(m.left, m.top, m.width, m.height, 'rgba(245,158,11,0.35)', m.value, 'rgba(180,83,9,0.95)'));
    gaps(el, { skip: isOurs }).forEach((g) => put(g.left, g.top, g.width, g.height, 'rgba(30,132,255,0.42)', g.value, 'rgba(30,111,208,0.95)'));
  }
  function moveHover(el: HTMLElement) {
    const idoc = idocRef.current;
    const c = ensureInspector();
    if (!idoc || !c) return;
    let h = hoverElRef.current;
    if (!h || !h.isConnected) {
      h = idoc.createElement('div');
      h.setAttribute(INSPECTOR_ATTR, '');
      h.style.cssText =
        'position:absolute;pointer-events:none;box-sizing:border-box;' +
        'outline:1px dashed rgba(30,132,255,0.9);background:rgba(30,132,255,0.06)';
      c.appendChild(h);
      hoverElRef.current = h;
    }
    const r = el.getBoundingClientRect();
    h.style.display = 'block';
    h.style.left = `${r.left}px`;
    h.style.top = `${r.top}px`;
    h.style.width = `${r.width}px`;
    h.style.height = `${r.height}px`;
  }
  function hideHover() {
    if (hoverElRef.current) hoverElRef.current.style.display = 'none';
  }

  // 클릭/방향키 공통 선택 진입점. 라이브 DOM 노드를 붙잡고 UI/오버레이를 갱신.
  const selectElement = useCallback((el: HTMLElement) => {
    selElRef.current = el;
    const leaf = el.children.length === 0;
    setSel({
      tag: el.tagName.toLowerCase(),
      css: el.getAttribute('style') || '',
      leaf,
      text: leaf ? el.textContent || '' : '',
    });
    // 선택 요소의 원본(computed) CSS 참고용 — 디자이너가 기존 값을 보고 오버라이드
    const win = iframeRef.current?.contentWindow;
    if (win) {
      const cs = win.getComputedStyle(el);
      setComputed(
        REF_PROPS.map((p) => ({ p, v: cs.getPropertyValue(p) })).filter((r) => r.v && r.v !== 'none'),
      );
    } else {
      setComputed([]);
    }
    hideHover();
    positionOverlay();
    renderInspector(el);
  }, []);

  const onPick = useCallback(
    (e: Event) => {
      if (!editableRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      const el = e.target as HTMLElement;
      if (!el || el.nodeType !== 1 || isOurs(el)) return;
      selectElement(el);
    },
    [selectElement],
  );

  // hover 미리보기 — 커서 밑 요소를 옅은 아웃라인으로.
  const onMove = useCallback((e: Event) => {
    if (!editableRef.current) return;
    const idoc = idocRef.current;
    if (!idoc) return;
    const me = e as MouseEvent;
    const el = idoc.elementFromPoint(me.clientX, me.clientY) as HTMLElement | null;
    if (!el || isOurs(el) || el === selElRef.current) {
      hideHover();
      return;
    }
    moveHover(el);
  }, []);

  // ↑ 부모 / ↓ 첫 자식 / ← → 형제 로 선택 이동. 얇은 그룹 컨테이너를 클릭 없이 잡기 위함.
  const onKey = useCallback(
    (e: Event) => {
      if (!editableRef.current) return;
      const cur = selElRef.current;
      if (!cur) return;
      const ke = e as KeyboardEvent;
      let next: Element | null = null;
      if (ke.key === 'ArrowUp') next = visibleParent(cur);
      else if (ke.key === 'ArrowDown') next = firstVisibleChild(cur, { skip: isOurs });
      else if (ke.key === 'ArrowRight') next = nextVisibleSibling(cur, { skip: isOurs });
      else if (ke.key === 'ArrowLeft') next = prevVisibleSibling(cur, { skip: isOurs });
      else return;
      ke.preventDefault();
      ke.stopPropagation();
      if (next) selectElement(next as HTMLElement);
    },
    [selectElement],
  );

  // iframe 내부 스크롤(문서/내부 컨테이너 모두 capture 로 포착) → 오버레이 재배치.
  // 부모 window scroll 리스너는 iframe 경계를 못 넘으므로 idoc 에 별도 등록해야 함. rAF throttle.
  const onFrameScroll = useCallback(() => {
    if (!selElRef.current) return;
    hideHover(); // 스크롤 중 hover 박스 드리프트 방지(다음 mousemove 에 복귀)
    if (scrollRafRef.current != null) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      if (!selElRef.current) return;
      positionOverlay();
      renderInspector(selElRef.current);
    });
  }, []);

  // 스냅샷 → iframe(rebuild). rrweb JSON 이면 편집 가능, 아니면(구버전 HTML) srcdoc 뷰 전용.
  useEffect(() => {
    const root = containerRef.current;
    if (!snap || !root) return;
    root.innerHTML = '';
    selElRef.current = null;
    setSel(null);
    setDirty(false);
    // 이전 iframe 과 함께 버려진 인스펙터 레이어 참조 초기화
    inspectorRef.current = null;
    hoverElRef.current = null;
    bandElsRef.current = [];

    const node = parseNode(snap.html);
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:100%;height:100%;border:0;background:#fff';
    if (!node) {
      iframe.setAttribute('sandbox', '');
      iframe.srcdoc = /^\s*<(!doctype|html)/i.test(snap.html)
        ? snap.html
        : `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:16px">${snap.html}</body></html>`;
      root.appendChild(iframe);
      iframeRef.current = iframe;
      idocRef.current = null;
      return;
    }
    iframe.setAttribute('sandbox', 'allow-same-origin'); // 스크립트 실행 차단, 부모는 DOM 접근 가능
    iframe.onload = () => {
      const idoc = iframe.contentDocument;
      if (!idoc) return;
      idoc.open();
      idoc.close();
      try {
        if (idoc.documentElement) idoc.removeChild(idoc.documentElement);
      } catch {
        /* noop */
      }
      rebuild(node as Parameters<typeof rebuild>[0], {
        doc: idoc,
        cache: createCache(),
        mirror: createMirror(),
        // iframe sandbox(allow-same-origin, no allow-scripts)로 스크립트 실행이 이미 차단됨 →
        // rrweb 의 unprotected-document 거부를 우회 (스크립트 위험 없음).
        UNSAFE_allowUnprotectedRebuild: true,
      });
      idocRef.current = idoc;
      idoc.addEventListener('click', onPick, true);
      idoc.addEventListener('mousemove', onMove, true);
      idoc.addEventListener('keydown', onKey, true);
      idoc.addEventListener('scroll', onFrameScroll, true);
    };
    root.appendChild(iframe);
    iframeRef.current = iframe;
  }, [snap, onPick, onMove, onKey, onFrameScroll]);

  // 모드 전환 → 편집 활성 여부만 토글(리빌드 없이 편집 보존)
  useEffect(() => {
    editableRef.current = mode === 'edit';
    if (mode === 'view') {
      selElRef.current = null;
      setSel(null);
      setComputed([]);
      if (overlayRef.current) overlayRef.current.style.display = 'none';
      clearBands();
      hideHover();
    }
  }, [mode]);

  useEffect(() => {
    const onScroll = () => {
      if (!sel) return;
      positionOverlay();
      if (selElRef.current) renderInspector(selElRef.current);
    };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [sel]);

  function applyCss(css: string) {
    setSel((s) => (s ? { ...s, css } : s));
    if (selElRef.current) selElRef.current.style.cssText = css;
    setDirty(true);
    positionOverlay();
  }
  function applyText(text: string) {
    setSel((s) => (s ? { ...s, text } : s));
    if (selElRef.current) selElRef.current.textContent = text;
    setDirty(true);
    positionOverlay();
  }
  // 참고 패널에서 속성 클릭 → 오버라이드 박스에 `prop: value;` 시드(없을 때만) → 값만 바꾸면 됨
  function seedOverride(prop: string, value: string) {
    const cur = sel?.css || '';
    if (new RegExp(`(^|;)\\s*${prop}\\s*:`).test(cur)) return; // 이미 있으면 유지
    const next = `${cur.trim()}${cur.trim() && !cur.trim().endsWith(';') ? ';' : ''} ${prop}: ${value};`.trim();
    applyCss(next);
  }

  async function save() {
    const idoc = idocRef.current;
    if (!idoc) return;
    setSaving(true);
    try {
      // 인스펙터 오버레이는 저장본에 포함되면 안 됨 → 직렬화 직전 제거
      inspectorRef.current?.remove();
      inspectorRef.current = null;
      hoverElRef.current = null;
      bandElsRef.current = [];
      const node = snapshot(idoc, { inlineStylesheet: true });
      const res = await fetch(`/api/snapshots/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: JSON.stringify(node) }),
      });
      if (!res.ok) alert((await res.json().catch(() => ({}))).error || '저장 실패');
      else setDirty(false);
    } finally {
      setSaving(false);
      // 저장 후에도 편집이 이어지도록 현재 선택의 인스펙터를 다시 렌더
      if (selElRef.current && editableRef.current) renderInspector(selElRef.current);
    }
  }

  async function reset() {
    if (!confirm('편집 내용을 버리고 원본 캡처로 되돌릴까요?')) return;
    const res = await fetch(`/api/snapshots/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reset: true }),
    });
    if (res.ok) setSnap((await res.json()).snapshot);
    else alert('리셋 실패');
  }

  async function changeStatus(next: 'OPEN' | 'RESOLVED') {
    const res = await fetch(`/api/snapshots/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) {
      setSnap((await res.json()).snapshot);
      if (next === 'RESOLVED') setMode('view');
    } else alert((await res.json().catch(() => ({}))).error || '상태 변경 실패');
  }

  async function del() {
    if (!confirm('이 To-Be 스냅샷을 삭제할까요?')) return;
    const res = await fetch(`/api/snapshots/${id}`, { method: 'DELETE' });
    if (res.ok) setDeleted(true);
    else alert((await res.json().catch(() => ({}))).error || '삭제 실패');
  }

  if (deleted) return <main style={S.msg}>스냅샷을 삭제했습니다. 이 창을 닫으셔도 됩니다.</main>;
  if (loading) return <main style={S.msg}>로딩 중…</main>;
  if (!authed)
    return (
      <main style={S.msg}>
        <p>To-Be 스냅샷을 보려면 로그인하세요.</p>
        <button style={S.primary} onClick={() => login(`/tobe/${id}`)}>로그인</button>
      </main>
    );
  if (!snap) return <main style={S.msg}>스냅샷을 찾을 수 없습니다.</main>;

  const isOpen = snap.status === 'OPEN';
  const editable = !!parseNode(snap.html) && isOpen; // 완료본은 편집 잠금
  const inEdit = mode === 'edit' && editable;

  return (
    <div style={S.wrap}>
      <header style={S.head}>
        <div>
          <strong>To-Be {inEdit ? '편집' : '프리뷰'}</strong>
          <span style={isOpen ? S.badgeOpen : S.badgeDone}>{isOpen ? '진행 중' : '완료'}</span>
          <span style={S.muted}> · {snap.urlKey}</span>
          {dirty && <span style={S.dirty}> · 저장 안 됨</span>}
        </div>
        <div style={S.toolbar}>
          {editable && (
            <div style={S.tabs}>
              <button style={mode === 'view' ? S.tabOn : S.tab} onClick={() => setMode('view')}>보기</button>
              <button style={mode === 'edit' ? S.tabOn : S.tab} onClick={() => setMode('edit')}>편집</button>
            </div>
          )}
          {inEdit && (
            <button style={S.primarySm} disabled={saving} onClick={save}>
              {saving ? '저장 중…' : '저장'}
            </button>
          )}
          {editable && <button style={S.ghostSm} onClick={reset}>원본으로 리셋</button>}
          {isOpen ? (
            <button style={S.doneSm} onClick={() => changeStatus('RESOLVED')}>완료</button>
          ) : (
            <button style={S.ghostSm} onClick={() => changeStatus('OPEN')}>다시 열기</button>
          )}
          <button style={S.danger} onClick={del}>삭제</button>
        </div>
      </header>
      {!isOpen && (
        <div style={S.doneBar}>
          완료된 피드백입니다. 이 스토리에서 <strong>새 스냅샷</strong>을 다시 만들 수 있습니다(확장의 “이 컴포넌트 스냅샷”).
        </div>
      )}

      <div style={S.body}>
        <div ref={containerRef} style={S.frame} />
        {inEdit && (
          <aside style={S.panel}>
            {!sel ? (
              <p style={S.muted}>편집할 요소를 클릭하세요. (마우스를 올리면 미리 보기)</p>
            ) : (
              <>
                <div style={S.selTag}>&lt;{sel.tag}&gt;</div>
                <p style={S.kbdHint}>↑ 부모 · ↓ 자식 · ← → 형제 로 선택 이동</p>
                <label style={S.label}>인라인 CSS</label>
                <textarea
                  style={S.cssArea}
                  value={sel.css}
                  spellCheck={false}
                  placeholder="color: red; font-size: 14px; ..."
                  onChange={(e) => applyCss(e.target.value)}
                />
                {computed.length > 0 && (
                  <>
                    <label style={S.label}>원본 CSS (클릭해 오버라이드에 추가)</label>
                    <div style={S.refList}>
                      {computed.map((r) => (
                        <button
                          key={r.p}
                          style={S.refRow}
                          title="이 속성을 오버라이드 박스에 추가"
                          onClick={() => seedOverride(r.p, r.v)}
                        >
                          <span style={S.refProp}>{r.p}</span>
                          <span style={S.refVal}>{r.v}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {sel.leaf && (
                  <>
                    <label style={S.label}>텍스트</label>
                    <textarea style={S.textArea} value={sel.text} onChange={(e) => applyText(e.target.value)} />
                  </>
                )}
                {!sel.leaf && <p style={S.hint}>자식이 있는 요소는 하위 요소를 각각 선택해 편집하세요.</p>}
                <button
                  style={S.ghostSm}
                  onClick={() => {
                    selElRef.current = null;
                    setSel(null);
                    setComputed([]);
                    if (overlayRef.current) overlayRef.current.style.display = 'none';
                    clearBands();
                    hideHover();
                  }}
                >
                  선택 해제
                </button>
              </>
            )}
          </aside>
        )}
      </div>
      <div ref={overlayRef} style={S.overlay} />
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' },
  head: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '10px 16px', borderBottom: '1px solid #e5e7eb', background: '#f8fafc', fontSize: 14 },
  muted: { color: '#6b7280', fontSize: 13 },
  dirty: { color: '#e5484d', fontSize: 12, fontWeight: 600 },
  toolbar: { display: 'flex', gap: 8, alignItems: 'center' },
  tabs: { display: 'inline-flex', border: '1px solid #d0d5dd', borderRadius: 8, overflow: 'hidden' },
  tab: { background: '#fff', color: '#374151', border: 0, padding: '5px 12px', cursor: 'pointer', fontSize: 13 },
  tabOn: { background: '#1e84ff', color: '#fff', border: 0, padding: '5px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  body: { flex: 1, display: 'flex', minHeight: 0 },
  frame: { flex: 1, background: '#f1f5f9', overflow: 'hidden' },
  panel: { width: 300, borderLeft: '1px solid #e5e7eb', padding: 14, overflow: 'auto', background: '#fff' },
  selTag: { font: '600 13px ui-monospace, monospace', color: '#1e6fd0', marginBottom: 4 },
  kbdHint: { fontSize: 11, color: '#8b95a1', margin: '0 0 10px' },
  label: { display: 'block', fontSize: 12, color: '#6b7280', margin: '8px 0 4px' },
  cssArea: { width: '100%', minHeight: 120, boxSizing: 'border-box', border: '1px solid #d0d5dd', borderRadius: 6, padding: 8, font: '12px ui-monospace, monospace', resize: 'vertical' },
  textArea: { width: '100%', minHeight: 56, boxSizing: 'border-box', border: '1px solid #d0d5dd', borderRadius: 6, padding: 8, font: 'inherit', fontSize: 13, resize: 'vertical' },
  hint: { fontSize: 12, color: '#8b95a1', marginTop: 8 },
  refList: { display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 240, overflow: 'auto', border: '1px solid #eef1f4', borderRadius: 6, padding: 4 },
  refRow: { display: 'flex', justifyContent: 'space-between', gap: 8, width: '100%', textAlign: 'left', background: 'transparent', border: 0, borderRadius: 4, padding: '3px 6px', cursor: 'pointer', font: '11px ui-monospace, monospace' },
  refProp: { color: '#8b5cf6' },
  refVal: { color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 },
  overlay: { position: 'fixed', display: 'none', pointerEvents: 'none', border: '2px solid #1e84ff', background: 'rgba(30,132,255,0.1)', zIndex: 9999, borderRadius: 2 },
  msg: { padding: 24, fontFamily: 'sans-serif', color: '#1a1a1a' },
  primary: { background: '#1e84ff', color: '#fff', border: 0, borderRadius: 6, padding: '8px 14px', fontWeight: 600, cursor: 'pointer', marginTop: 8 },
  primarySm: { background: '#1e84ff', color: '#fff', border: 0, borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer', fontSize: 13 },
  ghostSm: { background: 'transparent', color: '#6b7280', border: '1px solid #d0d5dd', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 13 },
  danger: { background: 'transparent', color: '#e5484d', border: '1px solid #f2b8ba', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 13 },
  doneSm: { background: '#e7f6ec', color: '#1a7f43', border: '1px solid #b7e4c7', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  badgeOpen: { marginLeft: 8, background: '#e0efff', color: '#1e6fd0', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600 },
  badgeDone: { marginLeft: 8, background: '#e7f6ec', color: '#1a7f43', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600 },
  doneBar: { padding: '8px 16px', background: '#f0fdf4', borderBottom: '1px solid #dcfce7', color: '#166534', fontSize: 13 },
};
