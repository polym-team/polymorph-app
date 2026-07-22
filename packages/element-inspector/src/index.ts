// @polym-team/element-inspector
//
// 프레임워크 무관 · DOM read-only 순수 계산 레이어.
// 박스모델(padding/margin) · 자식 간 gap · DOM 트리 순회를 "계산"만 하고,
// 그리기(오버레이 DOM)와 이벤트 배선은 소비처(direct-feedback 편집기 / 확장도구)가 소유한다.
//
// 좌표 규약: 모든 좌표는 대상 요소의 **뷰포트 상대** 값(getBoundingClientRect 기준)이다.
// 스크롤 오프셋(window.scrollX/Y)이나 iframe 오프셋은 렌더러가 더한다 —
// 그래야 일반 페이지(확장도구)와 iframe 내부(편집기) 양쪽에서 같은 계산을 재사용할 수 있다.

export type BoxKind = 'padding' | 'margin';
export type Side = 'top' | 'right' | 'bottom' | 'left';
export type GapAxis = 'h' | 'v';

/** 박스모델 링을 이루는 한 조각(위/아래/왼/오른쪽 중 하나). 뷰포트 상대 좌표. */
export interface InspectorBox {
  kind: BoxKind;
  side: Side;
  left: number;
  top: number;
  width: number;
  height: number;
  /** 해당 방향의 px 값(라벨용). */
  value: number;
}

/** 자식 요소들 사이의 실제 렌더 간격 밴드. 뷰포트 상대 좌표. */
export interface GapBand {
  axis: GapAxis;
  left: number;
  top: number;
  width: number;
  height: number;
  value: number;
}

export interface BoxModel {
  padding: InspectorBox[];
  margin: InspectorBox[];
}

/** 순회/gap 계산에서 특정 노드(예: 오버레이 자신)를 제외하기 위한 옵션. */
export interface TraverseOptions {
  /** true 를 반환하면 그 요소는 "없는 셈" 친다. */
  skip?: (el: Element) => boolean;
}

const px = (v: string): number => parseFloat(v) || 0;

/** 요소의 own document 기준 computed style — 크로스 realm(iframe) 안전. */
function computed(el: Element): CSSStyleDeclaration {
  const view = el.ownerDocument?.defaultView;
  return view ? view.getComputedStyle(el) : getComputedStyle(el);
}

/** 0크기·display:none·visibility:hidden 이면 "보이지 않음". */
export function isRenderVisible(el: Element): boolean {
  const r = el.getBoundingClientRect();
  if (r.width < 1 || r.height < 1) return false;
  const cs = computed(el);
  return cs.display !== 'none' && cs.visibility !== 'hidden';
}

function usable(el: Element, opts?: TraverseOptions): boolean {
  if (opts?.skip?.(el)) return false;
  return isRenderVisible(el);
}

// ── 박스모델(padding/margin) 계산 ─────────────────────────────
// 확장도구 renderBoxModel 의 계산부와 동일한 링 산술. padding 은 border 안쪽,
// margin 은 border box 바깥. 0.5px 이하는 무시.
export function boxModel(el: Element): BoxModel {
  const cs = computed(el);
  const r = el.getBoundingClientRect();
  const bt = px(cs.borderTopWidth);
  const bb = px(cs.borderBottomWidth);
  const bl = px(cs.borderLeftWidth);
  const br = px(cs.borderRightWidth);
  const pt = px(cs.paddingTop);
  const pb = px(cs.paddingBottom);
  const pl = px(cs.paddingLeft);
  const pr = px(cs.paddingRight);
  const mt = px(cs.marginTop);
  const mb = px(cs.marginBottom);
  const ml = px(cs.marginLeft);
  const mr = px(cs.marginRight);

  const padding: InspectorBox[] = [];
  const margin: InspectorBox[] = [];

  // padding — border 안쪽 링
  const inL = r.left + bl;
  const inT = r.top + bt;
  const inW = r.width - bl - br;
  const inH = r.height - bt - bb;
  if (pt > 0.5)
    padding.push({ kind: 'padding', side: 'top', left: inL, top: inT, width: inW, height: pt, value: pt });
  if (pb > 0.5)
    padding.push({ kind: 'padding', side: 'bottom', left: inL, top: r.bottom - bb - pb, width: inW, height: pb, value: pb });
  if (pl > 0.5)
    padding.push({ kind: 'padding', side: 'left', left: inL, top: inT + pt, width: pl, height: inH - pt - pb, value: pl });
  if (pr > 0.5)
    padding.push({ kind: 'padding', side: 'right', left: r.right - br - pr, top: inT + pt, width: pr, height: inH - pt - pb, value: pr });

  // margin — border box 바깥 링
  if (mt > 0.5)
    margin.push({ kind: 'margin', side: 'top', left: r.left - ml, top: r.top - mt, width: r.width + ml + mr, height: mt, value: mt });
  if (mb > 0.5)
    margin.push({ kind: 'margin', side: 'bottom', left: r.left - ml, top: r.bottom, width: r.width + ml + mr, height: mb, value: mb });
  if (ml > 0.5)
    margin.push({ kind: 'margin', side: 'left', left: r.left - ml, top: r.top, width: ml, height: r.height, value: ml });
  if (mr > 0.5)
    margin.push({ kind: 'margin', side: 'right', left: r.right, top: r.top, width: mr, height: r.height, value: mr });

  return { padding, margin };
}

// ── 자식 간 gap 계산 ──────────────────────────────────────────
// gap/margin/space-between 속성과 무관하게, 실제 렌더된 자식 rect 사이의 빈 픽셀을 측정.
interface RectLike {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
}

function rectCopy(r: DOMRect | RectLike): RectLike {
  return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
}

function unionRect(a: RectLike, b: RectLike): RectLike {
  const top = Math.min(a.top, b.top);
  const left = Math.min(a.left, b.left);
  const bottom = Math.max(a.bottom, b.bottom);
  const right = Math.max(a.right, b.right);
  return { top, left, bottom, right, width: right - left, height: bottom - top };
}

export function gaps(el: Element, opts?: TraverseOptions): GapBand[] {
  const kids = Array.from(el.children).filter((c) => usable(c, opts));
  if (kids.length < 2) return [];
  const rects = kids.map((k) => k.getBoundingClientRect());
  const bands: GapBand[] = [];

  // 세로로 50% 이상 겹치면 같은 행(row)으로 묶는다.
  const order = rects
    .map((_, i) => i)
    .sort((a, b) => rects[a].top - rects[b].top || rects[a].left - rects[b].left);
  const rows: { items: RectLike[]; rect: RectLike }[] = [];
  for (const i of order) {
    const r = rects[i];
    const row = rows.find((rw) => {
      const rr = rw.rect;
      const ov = Math.min(rr.bottom, r.bottom) - Math.max(rr.top, r.top);
      return ov > Math.min(rr.height, r.height) * 0.5;
    });
    if (row) {
      row.items.push(rectCopy(r));
      row.rect = unionRect(row.rect, r);
    } else {
      rows.push({ items: [rectCopy(r)], rect: rectCopy(r) });
    }
  }

  // 행 내부 가로 간격
  for (const row of rows) {
    const items = row.items.slice().sort((a, b) => a.left - b.left);
    for (let i = 0; i < items.length - 1; i++) {
      const gap = items[i + 1].left - items[i].right;
      if (gap <= 0.5) continue;
      const top = Math.max(items[i].top, items[i + 1].top);
      const bottom = Math.min(items[i].bottom, items[i + 1].bottom);
      bands.push({ axis: 'h', left: items[i].right, top, width: gap, height: bottom - top, value: gap });
    }
  }
  // 행 사이 세로 간격
  const sr = rows.slice().sort((a, b) => a.rect.top - b.rect.top);
  for (let i = 0; i < sr.length - 1; i++) {
    const gap = sr[i + 1].rect.top - sr[i].rect.bottom;
    if (gap <= 0.5) continue;
    const left = Math.max(sr[i].rect.left, sr[i + 1].rect.left);
    const right = Math.min(sr[i].rect.right, sr[i + 1].rect.right);
    bands.push({ axis: 'v', left, top: sr[i].rect.bottom, width: right - left, height: gap, value: gap });
  }

  return bands;
}

// ── DOM 트리 순회 ─────────────────────────────────────────────
// 편집기: 클릭으로 확정한 요소 기준 ↑=부모 / ↓=첫 자식 / ←→=형제.
// 보이지 않거나 skip 대상인 형제/자식은 건너뛴다.

/** ↑: 부모 요소. <html> 위로는 올라가지 않는다. */
export function visibleParent(el: Element): Element | null {
  const p = el.parentElement;
  if (!p || p.tagName === 'HTML') return null;
  return p;
}

/** ↓: 첫 번째로 보이는 자식. */
export function firstVisibleChild(el: Element, opts?: TraverseOptions): Element | null {
  for (const c of Array.from(el.children)) {
    if (usable(c, opts)) return c;
  }
  return null;
}

/** →: 다음으로 보이는 형제. */
export function nextVisibleSibling(el: Element, opts?: TraverseOptions): Element | null {
  let n = el.nextElementSibling;
  while (n) {
    if (usable(n, opts)) return n;
    n = n.nextElementSibling;
  }
  return null;
}

/** ←: 이전으로 보이는 형제. */
export function prevVisibleSibling(el: Element, opts?: TraverseOptions): Element | null {
  let n = el.previousElementSibling;
  while (n) {
    if (usable(n, opts)) return n;
    n = n.previousElementSibling;
  }
  return null;
}

/**
 * 커서 밑 요소 → body 까지의 조상 배열 [el, parent, ..., body].
 * 확장도구의 hover-path(↑/↓로 조상 레벨 순회) 모델용.
 */
export function ancestorsFrom(el: Element, opts?: TraverseOptions): Element[] {
  const path: Element[] = [];
  let n: Element | null = el;
  while (n && n.nodeType === 1 && n.tagName !== 'HTML' && !opts?.skip?.(n)) {
    path.push(n);
    if (n.tagName === 'BODY') break;
    n = n.parentElement;
  }
  return path;
}
