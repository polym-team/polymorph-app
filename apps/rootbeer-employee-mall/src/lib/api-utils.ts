import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { validateToken, TOKEN_COOKIE } from '@polymorph/shared-auth';
import { prisma } from './prisma';
import { ADMIN_EMAIL } from '@/types';
import type { UserRole } from '@/generated/prisma';

// oauth-server가 카카오처럼 email 없는 provider에 만들어주는 더미 이메일.
const DUMMY_EMAIL_SUFFIX = '@no-email.polymorph.co.kr';

export interface OAuthIdentity {
  sub: string; // oauth User.id (cuid) — users.oauth_user_id 와 매칭
  email: string;
  name: string;
  linkedEmails: string[];
}

export interface SessionUser {
  id: number; // rootbeer users.id (앵커, orders.user_id 그대로)
  oauthUserId: string; // 연결된 oauth sub
  email: string;
  name: string;
  role: UserRole;
}

/**
 * 쿠키의 JWT를 직접 검증해 oauth 신원을 얻는다.
 * 미들웨어 matcher가 /api를 제외하므로 헤더에 의존하지 않고 API 내부에서 직접 토큰을 본다.
 */
export async function getOAuthIdentity(): Promise<OAuthIdentity | null> {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!token) return null;
  const result = await validateToken(token);
  if (!result.valid || !result.payload) return null;
  const p = result.payload;
  return {
    sub: p.sub,
    email: p.email,
    name: p.name ?? '',
    linkedEmails: p.linkedEmails ?? [],
  };
}

/** 매칭 시도 이메일 후보. 대표가 더미면 linkedEmails 우선. */
function emailCandidates(id: OAuthIdentity): string[] {
  const isDummy = id.email.endsWith(DUMMY_EMAIL_SUFFIX);
  const all = isDummy ? [...id.linkedEmails, id.email] : [id.email, ...id.linkedEmails];
  return [...new Set(all.filter(Boolean))];
}

/**
 * 현재 세션의 "연결된" 로컬 User 를 반환한다 (oauth_user_id == sub).
 * 미연결(전환 미동의)이면 null — 자동 생성/연결하지 않는다(동의 게이트 필요).
 * 반환 user.id 는 Int 앵커라 기존 비즈니스 라우트가 그대로 사용.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const id = await getOAuthIdentity();
  if (!id) return null;
  const u = await prisma.user.findUnique({
    where: { oauthUserId: id.sub },
    select: { id: true, oauthUserId: true, email: true, name: true, role: true },
  });
  if (!u || !u.oauthUserId) return null;
  return { id: u.id, oauthUserId: u.oauthUserId, email: u.email, name: u.name, role: u.role };
}

export type Onboarding =
  | { status: 'anonymous' }
  | { status: 'linked'; user: SessionUser }
  | { status: 'needs_migrate'; oauth: OAuthIdentity; candidateEmail: string }
  | { status: 'needs_apply'; oauth: OAuthIdentity };

/**
 * 온보딩 상태 결정. /api/auth/me · /migrate · /apply 가 사용.
 * - anonymous: 토큰 없음/무효
 * - linked: 이미 연결된 회원 → 정상 진입 (role 별도 판정)
 * - needs_migrate: 미연결이나 email/linkedEmails 로 매칭되는 기존 회원 존재 → 전환 동의 유도
 * - needs_apply: 매칭 없음 → 신규 가입 신청 유도
 */
export async function resolveOnboarding(): Promise<Onboarding> {
  const id = await getOAuthIdentity();
  if (!id) return { status: 'anonymous' };

  const linked = await prisma.user.findUnique({
    where: { oauthUserId: id.sub },
    select: { id: true, oauthUserId: true, email: true, name: true, role: true },
  });
  if (linked?.oauthUserId) {
    return {
      status: 'linked',
      user: {
        id: linked.id,
        oauthUserId: linked.oauthUserId,
        email: linked.email,
        name: linked.name,
        role: linked.role,
      },
    };
  }

  for (const email of emailCandidates(id)) {
    const legacy = await prisma.user.findFirst({
      where: { email, oauthUserId: null },
      select: { email: true },
    });
    if (legacy) return { status: 'needs_migrate', oauth: id, candidateEmail: legacy.email };
  }
  return { status: 'needs_apply', oauth: id };
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    return { user: null, error: NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 }) };
  }
  if (user.role === 'pending') {
    return { user: null, error: NextResponse.json({ error: '승인 대기 중입니다' }, { status: 403 }) };
  }
  return { user, error: null };
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) {
    return { user: null, error: NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 }) };
  }
  if (user.role !== 'admin') {
    return { user: null, error: NextResponse.json({ error: '권한이 없습니다' }, { status: 403 }) };
  }
  return { user, error: null };
}

/** ADMIN_EMAIL 매칭 시 admin, 그 외 pending. 신규 연결/가입 시 초기 role 결정. */
export function initialRole(email: string, linkedEmails: string[]): UserRole {
  const all = [email, ...linkedEmails];
  return all.includes(ADMIN_EMAIL) ? 'admin' : 'pending';
}
