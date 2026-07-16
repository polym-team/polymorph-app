import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, getMembership } from '@/lib/auth';
import { computeSnapshotDiff } from '@/lib/snapshotDiff';

export const dynamic = 'force-dynamic';

// GET /api/snapshots/diff?groupId=&urlKey= — 진행 중(OPEN) to-be 변경(구조화). 그룹 멤버만.
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

  const snap = await prisma.snapshot.findFirst({ where: { groupId, urlKey, status: 'OPEN' } });
  if (!snap) return NextResponse.json({ snapshot: null, changes: [] });

  const diff = computeSnapshotDiff(snap.originalHtml, snap.html);
  if (!diff) {
    return NextResponse.json({ error: '스냅샷 형식이 rrweb JSON이 아닙니다(diff 불가)' }, { status: 422 });
  }

  return NextResponse.json({
    story: urlKey,
    version: diff.version,
    editedBy: snap.createdByName,
    updatedAt: snap.updatedAt,
    changeCount: diff.changes.length,
    changes: diff.changes,
  });
}
