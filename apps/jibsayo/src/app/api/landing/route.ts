export const dynamic = 'force-dynamic';

import { logger } from '@/app/api/shared/utils/logger';
import { fetchRecentTransactions, fetchRegionPriceSummaries } from './services/db';

export async function GET(): Promise<Response> {
  try {
    const [recentTransactions, regionSummaries] = await Promise.all([
      fetchRecentTransactions(),
      fetchRegionPriceSummaries(),
    ]);

    return Response.json({
      recentTransactions,
      regionSummaries,
    });
  } catch (error) {
    logger.error('랜딩 데이터 조회 오류', { error });

    return Response.json(
      {
        message: '서버 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}
