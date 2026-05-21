import { NextResponse } from 'next/server';
import { verifyCronKey } from '@/lib/cron-auth';
import { prisma } from '@/lib/prisma';
import {
  isPurchaseBlocked,
  Lotto645Mode,
  getCurrentRound,
} from '@/lib/dhlottery';
import type { Lotto645Ticket, BuyResult } from '@/lib/dhlottery';
import { decrypt } from '@/lib/crypto';
import { loginDhClient } from '@/lib/api-utils';
import { sendPurchaseSuccess, sendPurchaseFailure } from '@/lib/email';

const MAX_ATTEMPTS = 3;
const BACKOFF_MS = [3000, 10000];

async function buyWithRetry(
  dhlotteryId: string,
  password: string,
  tickets: Lotto645Ticket[],
): Promise<{ result: BuyResult | null; errorMessage: string | null; attempts: number }> {
  let lastError: string | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const { client, errorMessage: loginError } = await loginDhClient(dhlotteryId, password);
    if (!client) {
      lastError = loginError;
    } else {
      try {
        const result = await client.buyLotto645(tickets);
        if (result.success) {
          return { result, errorMessage: null, attempts: attempt };
        }
        lastError = result.message || '구매 실패 (사유 미상)';
      } catch (e) {
        lastError = e instanceof Error ? e.message : String(e);
      }
    }

    if (attempt < MAX_ATTEMPTS) {
      await new Promise((r) => setTimeout(r, BACKOFF_MS[attempt - 1] ?? 30000));
    }
  }

  return { result: null, errorMessage: lastError, attempts: MAX_ATTEMPTS };
}

export async function POST(req: Request) {
  const authError = verifyCronKey(req);
  if (authError) return authError;

  if (isPurchaseBlocked()) {
    return NextResponse.json({ error: '구매 차단 시간대입니다.' }, { status: 403 });
  }

  const accounts = await prisma.dhAccount.findMany({
    where: { autoEnabled: true },
    include: {
      presets: { orderBy: { slot: 'asc' } },
      user: { select: { email: true, name: true } },
    },
  });

  const results: Array<{
    accountId: number;
    dhlotteryId: string;
    success: boolean;
    attempts: number;
    message: string;
  }> = [];

  const currentRound = getCurrentRound();

  for (const account of accounts) {
    // 같은 회차에 이미 성공한 기록이 있으면 스킵 (cron 중복 호출 방어)
    const existingSuccess = await prisma.purchaseLog.findFirst({
      where: { accountId: account.id, roundNo: currentRound, success: true, source: 'auto' },
      select: { id: true },
    });
    if (existingSuccess) {
      results.push({
        accountId: account.id,
        dhlotteryId: account.dhlotteryId,
        success: true,
        attempts: 0,
        message: '이미 구매 완료된 회차입니다.',
      });
      continue;
    }

    // 같은 회차에 실패 기록이 이미 있으면 메일은 보내지 않음 (스팸 방지)
    const existingFailure = await prisma.purchaseLog.findFirst({
      where: { accountId: account.id, roundNo: currentRound, success: false, source: 'auto' },
      select: { id: true },
    });
    const failureEmailAlreadySent = existingFailure !== null;

    const tickets: Lotto645Ticket[] = account.presets.map((p) => {
      if (p.mode === 'manual' && p.numbers) {
        const nums = p.numbers
          .split(',')
          .map(Number)
          .filter((n) => n >= 1 && n <= 45);
        return {
          mode:
            nums.length === 6
              ? Lotto645Mode.MANUAL
              : nums.length > 0
                ? Lotto645Mode.SEMIAUTO
                : Lotto645Mode.AUTO,
          numbers: nums,
        };
      }
      return { mode: Lotto645Mode.AUTO, numbers: [] };
    });

    if (tickets.length === 0) {
      results.push({
        accountId: account.id,
        dhlotteryId: account.dhlotteryId,
        success: false,
        attempts: 0,
        message: '구매할 프리셋이 없습니다.',
      });
      continue;
    }

    const password = decrypt(account.dhlotteryPwEnc);
    const { result, errorMessage, attempts } = await buyWithRetry(
      account.dhlotteryId,
      password,
      tickets,
    );

    const nickname = account.nickname || account.dhlotteryId;

    if (result && result.success) {
      await prisma.purchaseLog.create({
        data: {
          accountId: account.id,
          roundNo: result.roundNo,
          ticketCount: tickets.length,
          totalAmount: tickets.length * 1000,
          slots: JSON.stringify(result.slots),
          source: 'auto',
          success: true,
        },
      });

      try {
        await sendPurchaseSuccess(account.user.email, account.user.name, {
          accountNickname: nickname,
          dhlotteryId: account.dhlotteryId,
          roundNo: result.roundNo,
          ticketCount: tickets.length,
          totalAmount: tickets.length * 1000,
          slots: result.slots,
        });
      } catch (e) {
        console.error(`[cron/auto-purchase] 성공 메일 발송 실패 (${account.id}):`, e);
      }

      results.push({
        accountId: account.id,
        dhlotteryId: account.dhlotteryId,
        success: true,
        attempts,
        message: result.message,
      });
    } else {
      const reason = errorMessage || '알 수 없는 오류';

      await prisma.purchaseLog.create({
        data: {
          accountId: account.id,
          roundNo: currentRound,
          ticketCount: tickets.length,
          totalAmount: tickets.length * 1000,
          slots: null,
          source: 'auto',
          success: false,
          errorMessage: reason,
        },
      });

      if (!failureEmailAlreadySent) {
        try {
          await sendPurchaseFailure(account.user.email, account.user.name, {
            accountNickname: nickname,
            dhlotteryId: account.dhlotteryId,
            roundNo: currentRound,
            errorMessage: reason,
            attemptCount: attempts,
          });
        } catch (e) {
          console.error(`[cron/auto-purchase] 실패 메일 발송 실패 (${account.id}):`, e);
        }
      }

      console.error(
        `[cron/auto-purchase] 계정 ${account.id} (${nickname}) 구매 실패 (${attempts}회 시도): ${reason}`,
      );

      results.push({
        accountId: account.id,
        dhlotteryId: account.dhlotteryId,
        success: false,
        attempts,
        message: reason,
      });
    }
  }

  const successCount = results.filter((r) => r.success).length;
  console.log(
    `[cron/auto-purchase] 총 ${accounts.length}개 계정, 성공 ${successCount}개, 실패 ${accounts.length - successCount}개`,
  );

  return NextResponse.json({ total: accounts.length, success: successCount, results });
}
