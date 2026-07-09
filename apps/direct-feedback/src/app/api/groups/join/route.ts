import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const Join = z.object({ token: z.string().min(1) });

// POST /api/groups/join { token } — 초대 링크 토큰으로 현재 사용자를 그룹에 합류시킨다.
// (초대 링크 방식은 join 시점에 userId 로 바로 멤버 생성 → 이메일 claim 불필요)
export async function POST(req: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const parsed = Join.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'token 이 필요합니다' }, { status: 400 });
  }

  const group = await prisma.group.findUnique({
    where: { inviteToken: parsed.data.token },
  });
  if (!group) {
    return NextResponse.json({ error: '유효하지 않은 초대 링크입니다' }, { status: 404 });
  }

  await prisma.groupMember.upsert({
    where: { groupId_email: { groupId: group.id, email: user.email } },
    update: { userId: user.userId },
    create: { groupId: group.id, email: user.email, userId: user.userId, role: 'MEMBER' },
  });

  return NextResponse.json({ group: { id: group.id, name: group.name } });
}
