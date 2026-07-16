import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth, getMembership } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const CreateSnapshot = z.object({
  groupId: z.string().min(1),
  urlKey: z.string().min(1),
  html: z.string().min(1),
});

// POST /api/snapshots — 스냅샷 캡처(그룹+urlKey당 1개, 재캡처는 덮어씀). 그룹 멤버만.
export async function POST(req: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const parsed = CreateSnapshot.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: '입력이 올바르지 않습니다' }, { status: 400 });
  }
  const { groupId, urlKey, html } = parsed.data;

  const me = await getMembership(user, groupId);
  if (!me) {
    return NextResponse.json({ error: '그룹 멤버가 아닙니다' }, { status: 403 });
  }

  // 캡처는 OPEN(진행 중) 스냅샷을 대상으로 find-or-create.
  // 완료(RESOLVED)본은 이력으로 남고, OPEN 이 없으면 새로 만든다 → 같은 스토리 재작업 가능.
  const open = await prisma.snapshot.findFirst({ where: { groupId, urlKey, status: 'OPEN' } });
  const snapshot = open
    ? await prisma.snapshot.update({
        where: { id: open.id },
        data: { html, originalHtml: html, createdBy: user.userId, createdByName: user.name },
      })
    : await prisma.snapshot.create({
        data: { groupId, urlKey, html, originalHtml: html, createdBy: user.userId, createdByName: user.name },
      });
  return NextResponse.json({ snapshot }, { status: 201 });
}

// GET /api/snapshots?groupId=&urlKey= — 특정 스토리의 스냅샷 존재 여부 조회
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

  // 진행 중(OPEN) 스냅샷만 반환 — 캡처 덮어쓰기 가드/링크용
  const snapshot = await prisma.snapshot.findFirst({
    where: { groupId, urlKey, status: 'OPEN' },
    select: { id: true, urlKey: true, status: true, createdByName: true, updatedAt: true },
  });
  return NextResponse.json({ snapshot });
}
