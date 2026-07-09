import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { validateToken, TOKEN_COOKIE } from '@polymorph/shared-auth';
import { prisma } from './prisma';

export interface SessionUser {
  userId: string;
  email: string;
  name: string;
}

/**
 * 확장은 `Authorization: Bearer <jwt>`, 대시보드는 HttpOnly 쿠키를 쓴다.
 * 둘 다 수용해서 토큰을 추출한다 (Bearer 우선).
 */
async function extractToken(): Promise<string | null> {
  const h = await headers();
  const authz = h.get('authorization');
  if (authz && authz.toLowerCase().startsWith('bearer ')) {
    return authz.slice(7).trim();
  }
  const c = await cookies();
  return c.get(TOKEN_COOKIE)?.value ?? null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = await extractToken();
  if (!token) return null;
  const result = await validateToken(token);
  if (!result.valid || !result.payload?.sub || !result.payload.email) return null;
  return {
    userId: result.payload.sub,
    email: result.payload.email,
    name: result.payload.name ?? '',
  };
}

type AuthOk = { user: SessionUser; error: null };
type AuthErr = { user: null; error: NextResponse };

export async function requireAuth(): Promise<AuthOk | AuthErr> {
  const user = await getSessionUser();
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 }),
    };
  }
  return { user, error: null };
}

/**
 * 이메일로 초대된 pending 멤버십(userId=null)을 현재 로그인 사용자에게 귀속(claim).
 * 매 멤버십 조회 전에 호출해 email→userId 매핑을 최신화한다.
 */
async function claimPendingMemberships(user: SessionUser): Promise<void> {
  await prisma.groupMember.updateMany({
    where: { email: user.email, userId: null },
    data: { userId: user.userId },
  });
}

export async function getMyGroupIds(user: SessionUser): Promise<string[]> {
  await claimPendingMemberships(user);
  const rows = await prisma.groupMember.findMany({
    where: { OR: [{ userId: user.userId }, { email: user.email }] },
    select: { groupId: true },
  });
  return [...new Set(rows.map((r) => r.groupId))];
}

/** 현재 사용자의 해당 그룹 멤버십(없으면 null). */
export async function getMembership(user: SessionUser, groupId: string) {
  await claimPendingMemberships(user);
  return prisma.groupMember.findFirst({
    where: { groupId, OR: [{ userId: user.userId }, { email: user.email }] },
  });
}
