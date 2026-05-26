import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCronKey } from '@/lib/cron-auth';
import { closeRoundAndOpenNext } from '@/lib/round-rollover';

export async function POST(req: Request) {
  const authError = verifyCronKey(req);
  if (authError) return authError;

  const now = new Date();
  const overdue = await prisma.orderRound.findMany({
    where: {
      status: 'open',
      deadline: { not: null, lte: now },
    },
    select: { id: true },
  });

  const results: Array<{ roundId: number; nextRoundId: number | null; skipped?: true }> = [];
  for (const round of overdue) {
    const result = await closeRoundAndOpenNext(round.id);
    if (!result) {
      results.push({ roundId: round.id, nextRoundId: null, skipped: true });
    } else {
      results.push({ roundId: round.id, nextRoundId: result.nextRoundId });
    }
  }

  console.log(`[cron/round-rollover] 마감 대상 ${overdue.length}건, 처리 ${results.filter((r) => !r.skipped).length}건`);

  return NextResponse.json({ total: overdue.length, results });
}
