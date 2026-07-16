import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth, getMembership } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const PatchSnapshot = z
  .object({
    html: z.string().min(1).optional(),
    reset: z.literal(true).optional(),
    status: z.enum(['OPEN', 'RESOLVED']).optional(),
  })
  .refine((v) => v.html !== undefined || v.reset || v.status !== undefined, {
    message: 'html, reset, status 중 하나는 필요합니다',
  });

// PATCH /api/snapshots/:id — 편집 저장(html) 또는 원본으로 리셋(reset). 그룹 멤버만.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const snapshot = await prisma.snapshot.findUnique({ where: { id } });
  if (!snapshot) {
    return NextResponse.json({ error: '스냅샷을 찾을 수 없습니다' }, { status: 404 });
  }
  const me = await getMembership(user, snapshot.groupId);
  if (!me) {
    return NextResponse.json({ error: '그룹 멤버가 아닙니다' }, { status: 403 });
  }
  const parsed = PatchSnapshot.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: '입력이 올바르지 않습니다' }, { status: 400 });
  }

  const data: {
    html?: string;
    status?: 'OPEN' | 'RESOLVED';
    resolvedAt?: Date | null;
    resolvedByName?: string | null;
  } = {};
  if (parsed.data.reset) data.html = snapshot.originalHtml;
  else if (parsed.data.html !== undefined) data.html = parsed.data.html;
  if (parsed.data.status !== undefined) {
    data.status = parsed.data.status;
    data.resolvedAt = parsed.data.status === 'RESOLVED' ? new Date() : null;
    data.resolvedByName = parsed.data.status === 'RESOLVED' ? user.name : null;
  }

  const updated = await prisma.snapshot.update({ where: { id }, data });
  return NextResponse.json({ snapshot: updated });
}

// GET /api/snapshots/:id — 스냅샷 단건(프리뷰/에디터용). 그룹 멤버만.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const snapshot = await prisma.snapshot.findUnique({ where: { id } });
  if (!snapshot) {
    return NextResponse.json({ error: '스냅샷을 찾을 수 없습니다' }, { status: 404 });
  }
  const me = await getMembership(user, snapshot.groupId);
  if (!me) {
    return NextResponse.json({ error: '그룹 멤버가 아닙니다' }, { status: 403 });
  }
  return NextResponse.json({ snapshot });
}

// DELETE /api/snapshots/:id — 스냅샷 삭제(잘못 찍은 경우). 그룹 멤버만.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const snapshot = await prisma.snapshot.findUnique({ where: { id } });
  if (!snapshot) {
    return NextResponse.json({ error: '스냅샷을 찾을 수 없습니다' }, { status: 404 });
  }
  const me = await getMembership(user, snapshot.groupId);
  if (!me) {
    return NextResponse.json({ error: '그룹 멤버가 아닙니다' }, { status: 403 });
  }
  await prisma.snapshot.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
