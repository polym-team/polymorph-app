import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth, getMembership } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const PatchSnapshot = z
  .object({ html: z.string().min(1).optional(), reset: z.literal(true).optional() })
  .refine((v) => v.html !== undefined || v.reset, { message: 'html 또는 reset 이 필요합니다' });

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

  const html = parsed.data.reset ? snapshot.originalHtml : parsed.data.html!;
  const updated = await prisma.snapshot.update({ where: { id }, data: { html } });
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
