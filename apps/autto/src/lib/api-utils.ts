import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from './auth';
import { prisma } from './prisma';
import { DhLotteryClient } from './dhlottery';
import { decrypt } from './crypto';

const ADMIN_EMAIL = 'majac6@gmail.com';

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
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
