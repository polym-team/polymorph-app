import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth, getMembership } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const UpdateProfile = z
  .object({
    name: z.string().min(1).max(100).optional(),
    domainPatterns: z.string().min(1).optional(),
    targetSelectors: z.string().min(1).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: '변경할 필드가 필요합니다' });

/** 프로필 조회 + OWNER 권한 확인 공통. */
async function requireOwnerOfProfile(id: string) {
  const { user, error } = await requireAuth();
  if (error) return { error } as const;
  const profile = await prisma.siteProfile.findUnique({ where: { id } });
  if (!profile) {
    return { error: NextResponse.json({ error: '프로필을 찾을 수 없습니다' }, { status: 404 }) } as const;
  }
  const me = await getMembership(user, profile.groupId);
  if (!me) {
    return { error: NextResponse.json({ error: '그룹 멤버가 아닙니다' }, { status: 403 }) } as const;
  }
  if (me.role !== 'OWNER') {
    return { error: NextResponse.json({ error: 'OWNER 만 설정할 수 있습니다' }, { status: 403 }) } as const;
  }
  return { profile } as const;
}

// PATCH /api/site-profiles/:id — 수정 (OWNER)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const guard = await requireOwnerOfProfile(id);
  if (guard.error) return guard.error;

  const parsed = UpdateProfile.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: '입력이 올바르지 않습니다' }, { status: 400 });
  }

  const profile = await prisma.siteProfile.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ profile });
}

// DELETE /api/site-profiles/:id — 삭제 (OWNER)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const guard = await requireOwnerOfProfile(id);
  if (guard.error) return guard.error;

  await prisma.siteProfile.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
