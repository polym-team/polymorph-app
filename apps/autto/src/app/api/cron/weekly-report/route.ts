import { NextResponse } from 'next/server';
import { verifyCronKey } from '@/lib/cron-auth';
import { prisma } from '@/lib/prisma';
import { DhLotteryClient } from '@/lib/dhlottery';
import { decrypt } from '@/lib/crypto';
import { sendWeeklyReport } from '@/lib/email';

export async function POST(req: Request) {
  const authError = verifyCronKey(req);
  if (authError) return authError;

  // 계정이 있는 모든 유저 조회
  const users = await prisma.user.findMany({
    where: { dhAccounts: { some: {} } },
    include: {
      dhAccounts: { select: { id: true, dhlotteryId: true, dhlotteryPwEnc: true, nickname: true } },
    },
  });

  const results: Array<{ email: string; success: boolean; message: string }> = [];

  for (const user of users) {
    const reports = [];

    for (const account of user.dhAccounts) {
      let history: Array<{
        roundNo: string;
        numbers: string;
        winResult: string;
        winAmount: string;
      }> = [];
      let balance = null;

      try {
        const password = decrypt(account.dhlotteryPwEnc);
        const client = await DhLotteryClient.create(account.dhlotteryId, password);

        // 구매내역 조회
        const rawHistory = await client.getPurchaseHistory();
        history = rawHistory.map((h) => ({
          roundNo: h.roundNo,
          numbers: h.numbers,
          winResult: h.winResult,
          winAmount: h.winAmount,
        }));

        // 예치금 조회
        try {
          const b = await client.getBalance();
          balance = {
            totalDeposit: b.totalDeposit,
            purchasableAmount: b.purchasableAmount,
            monthlyPurchaseTotal: b.monthlyPurchaseTotal,
          };
        } catch {
          // 예치금 조회 실패 시 null 유지
        }
      } catch {
        // 로그인 실패 시 빈 데이터로 리포트
      }

      reports.push({
        accountNickname: account.nickname || account.dhlotteryId,
        dhlotteryId: account.dhlotteryId,
        history,
        balance,
      });
    }

    try {
      await sendWeeklyReport(user.email, user.name, reports);
      results.push({ email: user.email, success: true, message: '발송 완료' });
    } catch (e) {
      results.push({
        email: user.email,
        success: false,
        message: e instanceof Error ? e.message : '발송 실패',
      });
    }
  }

  const successCount = results.filter((r) => r.success).length;
  console.log(`[cron/weekly-report] 총 ${users.length}명, 발송 성공 ${successCount}명`);

  return NextResponse.json({ total: users.length, success: successCount, results });
}
