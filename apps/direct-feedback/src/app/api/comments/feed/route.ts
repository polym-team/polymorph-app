import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, getMyGroupIds } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/comments/feed?status=open|resolved|all&groupId=<id>&author=me|all
 * 내가 속한 그룹 전체의 코멘트를 상태/그룹/작성자로 필터해 반환한다.
 * (그룹 스코프 조회인 /api/comments 와 달리 여러 그룹을 가로질러 본다.)
 */
export async function GET(req: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const myGroupIds = await getMyGroupIds(user);

  const groupParam = searchParams.get('groupId');
  const groupIds = groupParam
    ? myGroupIds.includes(groupParam)
      ? [groupParam]
      : [] // 내 그룹이 아니면 빈 결과
    : myGroupIds;

  const statusParam = searchParams.get('status');
  const status =
    statusParam === 'open' ? 'OPEN' : statusParam === 'resolved' ? 'RESOLVED' : undefined;

  const authorId = searchParams.get('author') === 'me' ? user.userId : undefined;

  const comments = await prisma.comment.findMany({
    where: { groupId: { in: groupIds }, status, authorId },
    include: {
      group: { select: { name: true, storybookBaseUrl: true } },
      _count: { select: { replies: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 500,
  });

  return NextResponse.json({ comments });
}
