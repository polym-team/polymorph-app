import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, getMembership } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/* rrweb serialized node (부분) */
type RRNode = {
  type: number;
  tagName?: string;
  attributes?: Record<string, string>;
  textContent?: string;
  childNodes?: RRNode[];
};

function styleMap(style: string): Record<string, string> {
  const m: Record<string, string> = {};
  for (const decl of String(style || '').split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const k = decl.slice(0, i).trim();
    const v = decl.slice(i + 1).trim();
    if (k) m[k] = v;
  }
  return m;
}

function seg(n: RRNode): string {
  if (n.type !== 2) return n.type === 3 ? '#text' : '';
  const cls = n.attributes?.class ? '.' + String(n.attributes.class).trim().split(/\s+/)[0] : '';
  return (n.tagName || '').toLowerCase() + cls;
}

type Change =
  | { selector: string; kind: 'style'; property: string; from: string | null; to: string | null }
  | { selector: string; kind: 'text' | 'class'; from: string; to: string };

const SKIP = new Set(['script', 'link', 'style', 'head']);

function diffNodes(orig: RRNode, edit: RRNode): Change[] {
  const changes: Change[] = [];
  function walk(a: RRNode, b: RRNode, path: string, inBody: boolean) {
    if (!a || !b) return;
    const tag = b.type === 2 && b.tagName ? b.tagName.toLowerCase() : '';
    const skip = SKIP.has(tag);
    if (inBody && !skip && a.type === 2 && b.type === 2) {
      // style 은 속성 단위로 diff
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

function versionHint(node: RRNode): string | null {
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

// GET /api/snapshots/diff?groupId=&urlKey= — 원본↔편집본 to-be 변경(구조화) 반환. 그룹 멤버만.
export async function GET(req: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get('groupId');
  const urlKey = searchParams.get('urlKey');
  if (!groupId || !urlKey) {
    return NextResponse.json({ error: 'groupId, urlKey가 필요합니다' }, { status: 400 });
  }
  const me = await getMembership(user, groupId);
  if (!me) {
    return NextResponse.json({ error: '그룹 멤버가 아닙니다' }, { status: 403 });
  }

  const snap = await prisma.snapshot.findUnique({ where: { groupId_urlKey: { groupId, urlKey } } });
  if (!snap) return NextResponse.json({ snapshot: null, changes: [] });

  let orig: RRNode | null = null;
  let edit: RRNode | null = null;
  try {
    orig = JSON.parse(snap.originalHtml);
    edit = JSON.parse(snap.html);
  } catch {
    return NextResponse.json({ error: '스냅샷 형식이 rrweb JSON이 아닙니다(diff 불가)' }, { status: 422 });
  }

  const changes = orig && edit ? diffNodes(orig, edit) : [];
  return NextResponse.json({
    story: urlKey,
    version: versionHint(edit || orig!),
    editedBy: snap.createdByName,
    updatedAt: snap.updatedAt,
    changeCount: changes.length,
    changes,
  });
}
