import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth, getMyGroupIds } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/groups — 내가 속한 그룹 목록
export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const ids = await getMyGroupIds(user);
  const groups = await prisma.group.findMany({
    where: { id: { in: ids } },
    include: { _count: { select: { comments: true, members: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ groups });
}

const CreateGroup = z.object({ name: z.string().min(1).max(100) });

// POST /api/groups — 그룹 생성 (생성자는 OWNER)
export async function POST(req: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const parsed = CreateGroup.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'name 이 필요합니다' }, { status: 400 });
  }

  const group = await prisma.group.create({
    data: {
      name: parsed.data.name,
      createdBy: user.userId,
      members: {
        create: { email: user.email, userId: user.userId, role: 'OWNER' },
      },
    },
  });
  return NextResponse.json({ group }, { status: 201 });
}
