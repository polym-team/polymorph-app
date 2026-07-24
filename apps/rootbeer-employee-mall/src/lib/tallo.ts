/** Tallo 입금 원장(read scope) HTTP 클라이언트. mall은 Tallo와 DB를 공유하지 않고 조회 API로 접근. */

export interface TalloDeposit {
  id: number;
  externalId: string;
  payerName: string;
  amount: number;
  txAt: string; // ISO8601
}

interface DepositsPage {
  items: TalloDeposit[];
  nextCursor: number | null;
}

/**
 * Tallo GET /api/deposits 를 커서 페이지네이션으로 전량 조회.
 * env: TALLO_BASE_URL(기본 prod), TALLO_READ_TOKEN(scope=read Bearer).
 */
export async function fetchDeposits(opts: { from?: Date } = {}): Promise<TalloDeposit[]> {
  const base = process.env.TALLO_BASE_URL ?? 'https://tallo.polymorph.co.kr';
  const token = process.env.TALLO_READ_TOKEN;
  if (!token) throw new Error('TALLO_READ_TOKEN이 설정되지 않았습니다.');

  const all: TalloDeposit[] = [];
  let cursor: number | null = null;

  // 안전 상한(무한 루프 방지): 500 * 50 = 25,000건.
  for (let i = 0; i < 50; i++) {
    const qs = new URLSearchParams();
    if (opts.from) qs.set('from', opts.from.toISOString());
    qs.set('limit', '500');
    if (cursor != null) qs.set('cursor', String(cursor));

    const res = await fetch(`${base}/api/deposits?${qs.toString()}`, {
      headers: { authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`Tallo 원장 조회 실패: HTTP ${res.status}`);
    }
    const page = (await res.json()) as DepositsPage;
    all.push(...page.items);
    if (page.nextCursor == null) break;
    cursor = page.nextCursor;
  }

  return all;
}
