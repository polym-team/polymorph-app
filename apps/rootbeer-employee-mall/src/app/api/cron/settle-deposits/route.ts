import { NextResponse } from 'next/server';
import { verifyCronKey } from '@/lib/cron-auth';
import { autoSettleHighConfidence } from '@/lib/deposit-settlement';

export const maxDuration = 60;

/**
 * POST /api/cron/settle-deposits — 입금 자동정산 크론.
 * Tallo 원장을 조회해 high 신뢰도(금액 유일+이름 일치 등) 매칭만 자동 정산.
 * review/ambiguous/unmatched는 관리자 검토 UI(/admin/deposits)에서 처리.
 */
export async function POST(req: Request) {
  const authError = verifyCronKey(req);
  if (authError) return authError;

  try {
    const summary = await autoSettleHighConfidence();
    console.log(
      `[cron/settle-deposits] auto=${summary.autoSettled} review=${summary.review} ambiguous=${summary.ambiguous} unmatched=${summary.unmatched}`
    );
    return NextResponse.json(summary);
  } catch (e) {
    console.error('[cron/settle-deposits] 실패', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : '자동정산 실패' },
      { status: 500 }
    );
  }
}
