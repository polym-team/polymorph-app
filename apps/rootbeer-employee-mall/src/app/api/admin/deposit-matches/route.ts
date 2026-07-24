import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-utils';
import { computeProposals, settleMatch } from '@/lib/deposit-settlement';

/**
 * GET /api/admin/deposit-matches — 관리자 검토용 매칭 제안 목록(DB 미변경).
 * high/review/ambiguous/unmatched 전부 반환.
 */
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const proposals = await computeProposals();
  return NextResponse.json({ proposals });
}

/**
 * POST /api/admin/deposit-matches — 관리자가 특정 주문↔입금 매칭을 확정 정산.
 * body: { orderId: number, externalId: string }
 */
export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  let body: { orderId?: unknown; externalId?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: '잘못된 요청 본문입니다.' }, { status: 400 });
  }

  const orderId = Number(body.orderId);
  const externalId = typeof body.externalId === 'string' ? body.externalId.trim() : '';
  if (!Number.isInteger(orderId) || orderId <= 0 || !externalId) {
    return NextResponse.json({ error: 'orderId와 externalId가 필요합니다.' }, { status: 400 });
  }

  const settled = await settleMatch(orderId, externalId);
  if (!settled) {
    return NextResponse.json(
      { error: '이미 정산된 주문이거나 이미 사용된 입금입니다.' },
      { status: 409 }
    );
  }
  return NextResponse.json({ ok: true, orderId, externalId });
}
