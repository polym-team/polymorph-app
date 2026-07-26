/**
 * 입금 ↔ 주문 매칭(순수 함수). 전략: "금액 유일성 우선 + 이름 확인용".
 *
 * - 라운드 내 미정산 주문 중 기대금액(total)이 입금액과 일치하는 후보를 찾는다.
 * - 후보가 1건: 이름 일치 → high(자동정산), 이름 불일치 → review(관리자 검토).
 * - 후보가 여러 건(금액 중복): 이름으로 1건 특정되면 high, 아니면 ambiguous(큐).
 * - 후보가 0건: unmatched(정산 무관 입금일 수 있음).
 *
 * high(자동정산 대상)만 주문을 선점(claim)하여 한 주문이 두 입금에 매칭되지 않게 한다.
 * review/ambiguous는 선점하지 않음(관리자가 최종 판단).
 */

export interface DepositRow {
  externalId: string;
  payerName: string;
  amount: number;
  txAt: string;
}

export interface EligibleOrder {
  orderId: number;
  roundId: number;
  userId: number;
  userName: string;
  total: number;
}

export type MatchConfidence = 'high' | 'review' | 'ambiguous' | 'unmatched';

export interface MatchProposal {
  deposit: DepositRow;
  order: EligibleOrder | null;
  confidence: MatchConfidence;
  reason: string;
}

function normalizeName(s: string): string {
  return s.replace(/\s+/g, '').trim();
}

/**
 * 공백 제거 후 완전 일치 또는 부분 포함 일치.
 * User.name이 "edward.k(김병우)"처럼 영문닉+괄호실명 형태라 은행 입금자명(김병우)과
 * 완전일치가 안 되는 경우가 흔해, 한쪽이 다른 쪽을 포함하면 일치로 본다.
 * 단일 글자 오탐 방지를 위해 짧은 쪽이 2자 이상일 때만 포함 매칭 허용.
 */
export function nameMatches(a: string, b: string): boolean {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (na.length < 2 || nb.length < 2) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

export function proposeMatches(
  deposits: DepositRow[],
  orders: EligibleOrder[]
): MatchProposal[] {
  const claimed = new Set<number>(); // high 매칭으로 선점된 orderId
  const proposals: MatchProposal[] = [];

  // 결정적 순서: 입금 시각 오름차순(먼저 온 입금이 선점).
  const sorted = [...deposits].sort((a, b) => a.txAt.localeCompare(b.txAt));

  for (const deposit of sorted) {
    const candidates = orders.filter(
      (o) => !claimed.has(o.orderId) && o.total === deposit.amount
    );

    if (candidates.length === 0) {
      proposals.push({
        deposit,
        order: null,
        confidence: 'unmatched',
        reason: '기대금액이 일치하는 미정산 주문 없음',
      });
      continue;
    }

    if (candidates.length === 1) {
      const order = candidates[0];
      if (nameMatches(deposit.payerName, order.userName)) {
        claimed.add(order.orderId);
        proposals.push({ deposit, order, confidence: 'high', reason: '금액 유일 + 이름 일치' });
      } else {
        proposals.push({
          deposit,
          order,
          confidence: 'review',
          reason: `금액 유일, 이름 불일치(입금:${deposit.payerName} / 주문:${order.userName})`,
        });
      }
      continue;
    }

    // 금액 중복 → 이름으로 특정 시도
    const nameHits = candidates.filter((o) => nameMatches(deposit.payerName, o.userName));
    if (nameHits.length === 1) {
      const order = nameHits[0];
      claimed.add(order.orderId);
      proposals.push({ deposit, order, confidence: 'high', reason: '금액 중복이나 이름으로 특정' });
    } else {
      proposals.push({
        deposit,
        order: null,
        confidence: 'ambiguous',
        reason: `금액 일치 ${candidates.length}건, 이름으로 특정 불가`,
      });
    }
  }

  return proposals;
}
