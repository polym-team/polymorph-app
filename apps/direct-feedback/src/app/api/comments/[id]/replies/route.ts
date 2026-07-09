import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth, getMembership } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const CreateReply = z.object({ body: z.string().min(1) });

// POST /api/comments/:id/replies — 코멘트에 답글 (그룹 멤버만)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id: commentId } = await params;
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) {
    return NextResponse.json({ error: '코멘트를 찾을 수 없습니다' }, { status: 404 });
  }
  const me = await getMembership(user, comment.groupId);
  if (!me) {
    return NextResponse.json({ error: '그룹 멤버가 아닙니다' }, { status: 403 });
  }

  const parsed = CreateReply.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'body 가 필요합니다' }, { status: 400 });
  }

  const reply = await prisma.commentReply.create({
    data: {
      commentId,
      body: parsed.data.body,
      authorId: user.userId,
      authorName: user.name,
    },
  });
  return NextResponse.json({ reply }, { status: 201 });
}
