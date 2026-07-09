import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth, getMembership } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const Invite = z.object({
  email: z.string().email(),
  role: z.enum(['OWNER', 'MEMBER']).default('MEMBER'),
});

// POST /api/groups/:id/invite — OWNER 가 이메일로 초대 (userId 는 초대 대상 최초 로그인 시 claim)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id: groupId } = await params;
  const me = await getMembership(user, groupId);
  if (!me) {
    return NextResponse.json({ error: '그룹 멤버가 아닙니다' }, { status: 403 });
  }
  if (me.role !== 'OWNER') {
    return NextResponse.json({ error: 'OWNER 만 초대할 수 있습니다' }, { status: 403 });
  }

  const parsed = Invite.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: '유효한 email 이 필요합니다' }, { status: 400 });
  }

  const member = await prisma.groupMember.upsert({
    where: { groupId_email: { groupId, email: parsed.data.email } },
    update: { role: parsed.data.role },
    create: { groupId, email: parsed.data.email, role: parsed.data.role },
  });
  return NextResponse.json({ member }, { status: 201 });
}
