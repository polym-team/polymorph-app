import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth, getMembership } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const UpdateGroup = z.object({
  // 빈 문자열 → null 로 저장(설정 해제). 그 외엔 http(s) URL.
  storybookBaseUrl: z.union([z.literal(''), z.string().url()]).optional(),
});

// PATCH /api/groups/:id — OWNER 가 그룹 설정(스토리북 base URL 등) 변경
export async function PATCH(
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

  const parsed = UpdateGroup.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: '유효한 URL 이 필요합니다' }, { status: 400 });
  }

  const data: { storybookBaseUrl?: string | null } = {};
  if (parsed.data.storybookBaseUrl !== undefined) {
    data.storybookBaseUrl = parsed.data.storybookBaseUrl || null;
  }

  const group = await prisma.group.update({ where: { id: groupId }, data });
  return NextResponse.json({ group });
}
