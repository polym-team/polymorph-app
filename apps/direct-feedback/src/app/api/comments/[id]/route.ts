import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth, getMembership } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const PatchComment = z
  .object({
    status: z.enum(['OPEN', 'RESOLVED', 'REJECTED']).optional(),
    body: z.string().min(1).optional(),
  })
  .refine((v) => v.status !== undefined || v.body !== undefined, {
    message: 'status 또는 body 중 하나는 필요합니다',
  });

// PATCH /api/comments/:id — 본문 수정(작성자만) / 상태 변경(비작성자만)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) {
    return NextResponse.json({ error: '코멘트를 찾을 수 없습니다' }, { status: 404 });
  }
  const me = await getMembership(user, comment.groupId);
  if (!me) {
    return NextResponse.json({ error: '그룹 멤버가 아닙니다' }, { status: 403 });
  }

  const parsed = PatchComment.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: '입력이 올바르지 않습니다' }, { status: 400 });
  }
  const { status, body } = parsed.data;
  const isAuthor = comment.authorId === user.userId;

  // 본문 수정은 작성자만
  if (body !== undefined && !isAuthor) {
    return NextResponse.json({ error: '작성자만 수정할 수 있습니다' }, { status: 403 });
  }
  // 상태 변경(해결/반려/열기)은 작성자를 제외한 멤버만
  if (status !== undefined && isAuthor) {
    return NextResponse.json(
      { error: '작성자는 상태를 변경할 수 없습니다' },
      { status: 403 },
    );
  }

  const updated = await prisma.comment.update({
    where: { id },
    data: {
      body,
      status,
      resolvedAt: status === 'RESOLVED' ? new Date() : status !== undefined ? null : undefined,
      rejectedAt: status === 'REJECTED' ? new Date() : status !== undefined ? null : undefined,
    },
  });
  return NextResponse.json({ comment: updated });
}

// DELETE /api/comments/:id — 코멘트 삭제(완료 제거). 답글은 cascade. (그룹 멤버만)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) {
    return NextResponse.json({ error: '코멘트를 찾을 수 없습니다' }, { status: 404 });
  }
  const me = await getMembership(user, comment.groupId);
  if (!me) {
    return NextResponse.json({ error: '그룹 멤버가 아닙니다' }, { status: 403 });
  }
  if (comment.authorId !== user.userId) {
    return NextResponse.json({ error: '작성자만 삭제할 수 있습니다' }, { status: 403 });
  }

  await prisma.comment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
