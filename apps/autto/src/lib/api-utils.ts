import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from './auth';
import { prisma } from './prisma';
import { DhLotteryClient } from './dhlottery';
import { decrypt } from './crypto';

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

/**
 * DhAccount ID로 동행복권 클라이언트 생성
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
  const client = await DhLotteryClient.create(account.dhlotteryId, password);
  return { client, error: null };
}
