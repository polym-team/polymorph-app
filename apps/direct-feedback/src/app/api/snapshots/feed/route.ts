import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, getMyGroupIds } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/snapshots/feed?status=open|resolved|all&groupId=<id>
 * 내가 속한 그룹 전체의 To-Be 스냅샷 목록을 상태/그룹으로 필터해 반환한다.
 * (단건 조회인 GET /api/snapshots?groupId&urlKey 와 달리 여러 그룹을 가로질러 나열한다.)
 * html/originalHtml(LongText)은 목록 페이로드에서 제외한다.
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

  const snapshots = await prisma.snapshot.findMany({
    where: { groupId: { in: groupIds }, status },
    select: {
      id: true,
      urlKey: true,
      status: true,
      createdByName: true,
      resolvedByName: true,
      updatedAt: true,
      group: { select: { name: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 500,
  });

  return NextResponse.json({ snapshots });
}
