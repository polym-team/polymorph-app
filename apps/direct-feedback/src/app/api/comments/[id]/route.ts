import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth, getMembership } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const PatchComment = z
  .object({
    status: z.enum(['OPEN', 'RESOLVED']).optional(),
    body: z.string().min(1).optional(),
  })
  .refine((v) => v.status !== undefined || v.body !== undefined, {
    message: 'status 또는 body 중 하나는 필요합니다',
  });

// PATCH /api/comments/:id — resolve / 본문 수정 (그룹 멤버만)
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

  const updated = await prisma.comment.update({
    where: { id },
    data: {
      body: parsed.data.body,
      status: parsed.data.status,
      resolvedAt:
        parsed.data.status === 'RESOLVED'
          ? new Date()
          : parsed.data.status === 'OPEN'
            ? null
            : undefined,
    },
  });
  return NextResponse.json({ comment: updated });
}
