import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-utils';
import { computeRoundSettlement } from '@/lib/settlement';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const roundId = Number(id);

  const rows = await computeRoundSettlement(roundId);

  // 기존 응답 스키마(snake_case, user 단위) + 정산 상태 필드.
  const settlement = rows.map((r) => ({
    user_id: r.userId,
    user_name: r.userName,
    user_email: r.userEmail,
    items_total: r.itemsTotal,
    shipping_share: r.shippingShare,
    total: r.total,
    settled: r.matchedDepositId != null,
    settled_at: r.settledAt ? r.settledAt.toISOString() : null,
    confirm_no: r.matchedDepositId ? r.matchedDepositId.slice(0, 16) : null,
  }));

  return NextResponse.json(settlement);
}
