import { prisma } from '@/lib/prisma';
import {
  DepositRow,
  EligibleOrder,
  MatchProposal,
  proposeMatches,
} from '@/lib/deposit-matcher';
import { computeRoundSettlement } from '@/lib/settlement';
import { fetchDeposits } from '@/lib/tallo';

// 원장 조회 기간(과도한 옛 입금 배제). 필요 시 조정.
const LOOKBACK_DAYS = 45;

/**
 * 자동정산 후보 산출. 상태 'ordered'(구매완료·정산대기) 라운드의 미정산 주문 vs
 * 아직 소비되지 않은 Tallo 입금을 매칭한 제안 목록. DB를 변경하지 않는다(조회 전용).
 */
export async function computeProposals(): Promise<MatchProposal[]> {
  const rounds = await prisma.orderRound.findMany({
    where: { status: 'ordered' },
    select: { id: true },
  });

  const eligible: EligibleOrder[] = [];
  for (const round of rounds) {
    const settlement = await computeRoundSettlement(round.id);
    const matchState = await prisma.order.findMany({
      where: { roundId: round.id },
      select: { id: true, matchedDepositId: true },
    });
    const matched = new Map(matchState.map((o) => [o.id, o.matchedDepositId]));
    for (const s of settlement) {
      if (matched.get(s.orderId)) continue; // 이미 정산된 주문 제외
      eligible.push({
        orderId: s.orderId,
        roundId: round.id,
        userId: s.userId,
        userName: s.userName,
        total: s.total,
      });
    }
  }

  // 이미 소비된 입금(externalId) 제외
  const used = await prisma.order.findMany({
    where: { matchedDepositId: { not: null } },
    select: { matchedDepositId: true },
  });
  const usedSet = new Set(used.map((u) => u.matchedDepositId as string));

  const from = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const deposits = await fetchDeposits({ from });
  const depRows: DepositRow[] = deposits
    .filter((d) => !usedSet.has(d.externalId))
    .map((d) => ({
      externalId: d.externalId,
      payerName: d.payerName,
      amount: d.amount,
      txAt: d.txAt,
    }));

  return proposeMatches(depRows, eligible);
}

/**
 * 주문을 특정 입금으로 정산 처리. 멱등/경합 방지를 위해
 * "미정산 주문 + 미소비 입금"일 때만 갱신한다.
 * @returns 실제로 정산됐으면 true.
 */
export async function settleMatch(orderId: number, externalId: string): Promise<boolean> {
  // 이 입금이 이미 다른 주문에 소비됐는지 확인
  const alreadyUsed = await prisma.order.findFirst({
    where: { matchedDepositId: externalId },
    select: { id: true },
  });
  if (alreadyUsed) return false;

  // 미정산(matchedDepositId=null)인 경우에만 갱신
  const res = await prisma.order.updateMany({
    where: { id: orderId, matchedDepositId: null },
    data: { matchedDepositId: externalId, settledAt: new Date(), status: 'settled' },
  });
  return res.count > 0;
}

export interface AutoSettleSummary {
  autoSettled: number;
  review: number;
  ambiguous: number;
  unmatched: number;
  settledOrderIds: number[];
}

/** high 신뢰도 제안만 자동 정산 처리(크론용). */
export async function autoSettleHighConfidence(): Promise<AutoSettleSummary> {
  const proposals = await computeProposals();
  const summary: AutoSettleSummary = {
    autoSettled: 0,
    review: 0,
    ambiguous: 0,
    unmatched: 0,
    settledOrderIds: [],
  };

  for (const p of proposals) {
    if (p.confidence === 'high' && p.order) {
      const done = await settleMatch(p.order.orderId, p.deposit.externalId);
      if (done) {
        summary.autoSettled++;
        summary.settledOrderIds.push(p.order.orderId);
      }
    } else if (p.confidence === 'review') {
      summary.review++;
    } else if (p.confidence === 'ambiguous') {
      summary.ambiguous++;
    } else {
      summary.unmatched++;
    }
  }

  return summary;
}
