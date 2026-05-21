import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { validateToken, TOKEN_COOKIE } from '@polymorph/shared-auth';
import { prisma } from './prisma';
import { DhLotteryClient } from './dhlottery';
import { decrypt } from './crypto';

const ADMIN_EMAIL = 'majac6@gmail.com';

export interface AuttoUser {
  id: number;
  email: string;
  name: string;
}

/**
 * 쿠키의 JWT를 직접 검증해 oauth 사용자 정보를 얻고, autto 로컬 User row를 보장한다.
 * 미들웨어 matcher가 /api를 제외하므로 헤더에 의존하지 않고 API 내부에서 직접 토큰을 본다.
 *
 * Phase 1 임시 어댑터: oauth User → autto User.id(int) 매핑.
 *   1) payload.email로 먼저 시도 (provider가 google 단일 사용자이거나 진짜 email인 경우)
 *   2) 실패 시 payload.linkedEmails 순회 (카카오 더미 email 등 마이그레이션 매핑)
 *   3) 그래도 없으면 신규 생성 (대표 email은 payload.email 그대로)
 * Phase 2에서 autto users 테이블 제거 + FK 교체하면 이 함수도 사라진다.
 */
export async function getSessionUser(): Promise<AuttoUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  if (!token) return null;

  const result = await validateToken(token);
  if (!result.valid || !result.payload) return null;

  const primaryEmail = result.payload.email;
  const linkedEmails = result.payload.linkedEmails ?? [];
  const name = result.payload.name ?? '';
  // oauth-server가 카카오처럼 email 없는 provider에 만들어주는 가짜 email.
  // 이 경우 진짜 사용자 식별은 linkedEmails 쪽에 있다고 봐야 한다.
  const isPrimaryDummy = primaryEmail.endsWith('@no-email.polymorph.co.kr');

  // primary가 더미면 linkedEmails를 먼저, 진짜 email이면 primary를 먼저 시도.
  const lookupOrder: string[] = isPrimaryDummy
    ? [...linkedEmails, primaryEmail]
    : [primaryEmail, ...linkedEmails];

  let user: AuttoUser | null = null;
  for (const candidate of lookupOrder) {
    user = await prisma.user.findUnique({
      where: { email: candidate },
      select: { id: true, email: true, name: true },
    });
    if (user) break;
  }

  // 3) 없으면 신규 생성 (대표 email 사용)
  if (!user) {
    user = await prisma.user.create({
      data: { email: primaryEmail, name },
      select: { id: true, email: true, name: true },
    });
  } else if (name && user.name !== name) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { name },
      select: { id: true, email: true, name: true },
    });
  }

  return user;
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 }),
    };
  }
  return { user, error: null };
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) {
    return { user: null, error: NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 }) };
  }
  if (user.email !== ADMIN_EMAIL) {
    return { user: null, error: NextResponse.json({ error: '권한이 없습니다' }, { status: 403 }) };
  }
  return { user, error: null };
}

/**
 * dhlottery 아이디/비밀번호로 클라이언트 생성 (세션 캐싱 + 1회 재로그인)
 * cron / API 라우트 양쪽에서 공용으로 사용.
 */
export async function loginDhClient(dhlotteryId: string, password: string) {
  try {
    const client = await DhLotteryClient.create(dhlotteryId, password);
    return { client, errorMessage: null as string | null };
  } catch {
    DhLotteryClient.invalidateSession(dhlotteryId);
    try {
      const client = await DhLotteryClient.create(dhlotteryId, password);
      return { client, errorMessage: null as string | null };
    } catch (retryError) {
      return {
        client: null,
        errorMessage:
          retryError instanceof Error ? retryError.message : '동행복권 로그인 실패',
      };
    }
  }
}

/**
 * DhAccount ID로 동행복권 클라이언트 생성 (세션 캐싱 지원)
 */
export async function createDhClient(accountId: number, userId: number) {
  const account = await prisma.dhAccount.findFirst({
    where: { id: accountId, userId },
    select: { dhlotteryId: true, dhlotteryPwEnc: true },
  });

  if (!account) {
    return {
      client: null,
      error: NextResponse.json(
        { error: '동행복권 계정을 찾을 수 없습니다.' },
        { status: 404 },
      ),
    };
  }

  const password = decrypt(account.dhlotteryPwEnc);
  const { client, errorMessage } = await loginDhClient(account.dhlotteryId, password);

  if (!client) {
    return {
      client: null,
      error: NextResponse.json({ error: errorMessage }, { status: 502 }),
    };
  }

  return { client, error: null };
}
