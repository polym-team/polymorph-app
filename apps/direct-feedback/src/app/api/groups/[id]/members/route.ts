import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, getMembership } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/groups/:id/members — 그룹 멤버 목록 (멤버만)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id: groupId } = await params;
  const me = await getMembership(user, groupId);
  if (!me) {
    return NextResponse.json({ error: '그룹 멤버가 아닙니다' }, { status: 403 });
  }

  const members = await prisma.groupMember.findMany({
    where: { groupId },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json({ members });
}
