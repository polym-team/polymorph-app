// rrweb 스냅샷(원본 vs 편집본) 구조 diff — diff API 와 MCP get_tobe 가 공유.

type RRNode = {
  type: number;
  tagName?: string;
  attributes?: Record<string, string>;
  textContent?: string;
  childNodes?: RRNode[];
};

export type SnapshotChange =
  | { selector: string; kind: 'style'; property: string; from: string | null; to: string | null }
  | { selector: string; kind: 'text' | 'class'; from: string; to: string };

const SKIP = new Set(['script', 'link', 'style', 'head']);

function styleMap(style: string): Record<string, string> {
  const m: Record<string, string> = {};
  for (const decl of String(style || '').split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const k = decl.slice(0, i).trim();
    if (k) m[k] = decl.slice(i + 1).trim();
  }
  return m;
}

function seg(n: RRNode): string {
  if (n.type !== 2) return n.type === 3 ? '#text' : '';
  const cls = n.attributes?.class ? '.' + String(n.attributes.class).trim().split(/\s+/)[0] : '';
  return (n.tagName || '').toLowerCase() + cls;
}

export function diffSnapshots(orig: RRNode, edit: RRNode): SnapshotChange[] {
  const changes: SnapshotChange[] = [];
  function walk(a: RRNode, b: RRNode, path: string, inBody: boolean) {
    if (!a || !b) return;
    const tag = b.type === 2 && b.tagName ? b.tagName.toLowerCase() : '';
    if (inBody && !SKIP.has(tag) && a.type === 2 && b.type === 2) {
      const sa = styleMap(a.attributes?.style || '');
      const sb = styleMap(b.attributes?.style || '');
      for (const k of new Set([...Object.keys(sa), ...Object.keys(sb)])) {
        if ((sa[k] ?? '') !== (sb[k] ?? '')) {
          changes.push({ selector: path, kind: 'style', property: k, from: sa[k] ?? null, to: sb[k] ?? null });
        }
      }
      const ca = a.attributes?.class ?? '';
      const cb = b.attributes?.class ?? '';
      if (ca !== cb) changes.push({ selector: path, kind: 'class', from: ca, to: cb });
    } else if (inBody && a.type === 3 && b.type === 3) {
      const ta = (a.textContent || '').trim();
      const tb = (b.textContent || '').trim();
      if (ta !== tb) changes.push({ selector: path, kind: 'text', from: ta, to: tb });
    }
    const nowBody = inBody || tag === 'body';
    const ac = a.childNodes || [];
    const bc = b.childNodes || [];
    const n = Math.min(ac.length, bc.length);
    for (let i = 0; i < n; i++) walk(ac[i], bc[i], `${path} > ${seg(bc[i])}`, nowBody);
  }
  walk(orig, edit, seg(orig) || 'html', false);
  return changes;
}

export function versionHint(node: RRNode): string | null {
  let hint: string | null = null;
  (function scan(n: RRNode) {
    if (!n || typeof n !== 'object') return;
    for (const key of ['href', 'src'] as const) {
      const v = n.attributes?.[key];
      if (v && !hint) {
        const m = v.match(/\/storybook\/([^/]+\/\d+)\//);
        if (m) hint = m[1];
      }
    }
    (n.childNodes || []).forEach(scan);
  })(node);
  return hint;
}

/** originalHtml/editedHtml (rrweb JSON 문자열)로부터 구조화 diff + 버전 힌트. 파싱 실패 시 null. */
export function computeSnapshotDiff(
  originalHtml: string,
  editedHtml: string,
): { changes: SnapshotChange[]; version: string | null } | null {
  let orig: RRNode;
  let edit: RRNode;
  try {
    orig = JSON.parse(originalHtml);
    edit = JSON.parse(editedHtml);
  } catch {
    return null;
  }
  return { changes: diffSnapshots(orig, edit), version: versionHint(edit) ?? versionHint(orig) };
}
