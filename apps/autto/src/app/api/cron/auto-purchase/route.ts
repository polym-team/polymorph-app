import { NextResponse } from 'next/server';
import { verifyCronKey } from '@/lib/cron-auth';
import { prisma } from '@/lib/prisma';
import { DhLotteryClient, isPurchaseBlocked, Lotto645Mode } from '@/lib/dhlottery';
import type { Lotto645Ticket } from '@/lib/dhlottery';
import { decrypt } from '@/lib/crypto';

export async function POST(req: Request) {
  const authError = verifyCronKey(req);
  if (authError) return authError;

  if (isPurchaseBlocked()) {
    return NextResponse.json({ error: '구매 차단 시간대입니다.' }, { status: 403 });
  }

  // 자동구매 활성화된 계정 조회
  const accounts = await prisma.dhAccount.findMany({
    where: { autoEnabled: true },
    include: {
      presets: { orderBy: { slot: 'asc' } },
      user: { select: { name: true } },
    },
  });

  const results: Array<{
    accountId: number;
    dhlotteryId: string;
    success: boolean;
    message: string;
  }> = [];

  for (const account of accounts) {
    try {
      const password = decrypt(account.dhlotteryPwEnc);
      const client = await DhLotteryClient.create(account.dhlotteryId, password);

      const tickets: Lotto645Ticket[] = account.presets.map((p) => {
        if (p.mode === 'manual' && p.numbers) {
          const nums = p.numbers.split(',').map(Number).filter((n) => n >= 1 && n <= 45);
          return {
            mode: nums.length === 6 ? Lotto645Mode.MANUAL : nums.length > 0 ? Lotto645Mode.SEMIAUTO : Lotto645Mode.AUTO,
            numbers: nums,
          };
        }
        return { mode: Lotto645Mode.AUTO, numbers: [] };
      });

      const result = await client.buyLotto645(tickets);

      if (result.success) {
        await prisma.purchaseLog.create({
          data: {
            accountId: account.id,
            roundNo: result.roundNo,
            ticketCount: tickets.length,
            totalAmount: tickets.length * 1000,
            slots: JSON.stringify(result.slots),
            source: 'auto',
          },
        });
      }

      results.push({
        accountId: account.id,
        dhlotteryId: account.dhlotteryId,
        success: result.success,
        message: result.message,
      });
    } catch (e) {
      results.push({
        accountId: account.id,
        dhlotteryId: account.dhlotteryId,
        success: false,
        message: e instanceof Error ? e.message : '알 수 없는 오류',
      });
    }
  }

  const successCount = results.filter((r) => r.success).length;
  console.log(`[cron/auto-purchase] 총 ${accounts.length}개 계정, 성공 ${successCount}개`);

  return NextResponse.json({ total: accounts.length, success: successCount, results });
}
