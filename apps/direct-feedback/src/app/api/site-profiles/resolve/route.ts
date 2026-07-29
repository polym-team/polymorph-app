import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, getMyGroupIds } from '@/lib/auth';
import { hostMatchesAny, parseSelectors } from '@/lib/siteProfile';

export const dynamic = 'force-dynamic';

/**
 * GET /api/site-profiles/resolve?host=<hostname>
 * 확장이 현재 탭 호스트로 호출 → 내가 속한 그룹들의 프로필 중 매칭되는 첫 프로필을 반환.
 * 등록 도메인은 주입 권한이 아니라 "어느 그룹·어떤 선택자인지" 조회용.
 */
export async function GET(req: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const host = new URL(req.url).searchParams.get('host');
  if (!host) {
    return NextResponse.json({ error: 'host 가 필요합니다' }, { status: 400 });
  }

  const myGroupIds = await getMyGroupIds(user);
  const profiles = await prisma.siteProfile.findMany({
    where: { groupId: { in: myGroupIds } },
    include: { group: { select: { name: true } } },
    orderBy: { createdAt: 'asc' },
  });

  const match = profiles.find((p) => hostMatchesAny(host, p.domainPatterns));
  if (!match) {
    return NextResponse.json({ profile: null });
  }

  return NextResponse.json({
    profile: {
      id: match.id,
      groupId: match.groupId,
      groupName: match.group.name,
      name: match.name,
      selectors: parseSelectors(match.targetSelectors),
    },
  });
}
