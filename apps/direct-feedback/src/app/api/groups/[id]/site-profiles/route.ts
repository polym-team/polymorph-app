import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth, getMembership } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/groups/:id/site-profiles — 그룹의 사이트 프로필 목록 (멤버)
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

  const profiles = await prisma.siteProfile.findMany({
    where: { groupId },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json({ profiles });
}

const CreateProfile = z.object({
  name: z.string().min(1).max(100),
  domainPatterns: z.string().min(1),
  targetSelectors: z.string().min(1),
});

// POST /api/groups/:id/site-profiles — 사이트 프로필 생성 (OWNER)
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
    return NextResponse.json({ error: 'OWNER 만 설정할 수 있습니다' }, { status: 403 });
  }

  const parsed = CreateProfile.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: '입력이 올바르지 않습니다' }, { status: 400 });
  }

  const profile = await prisma.siteProfile.create({
    data: { groupId, ...parsed.data },
  });
  return NextResponse.json({ profile }, { status: 201 });
}
