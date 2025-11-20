/**
 * 배치 작업: 매일 거래 ID 스냅샷 저장
 * GET /api/batch
 *
 * 국토부 API에서 거래 데이터를 조회하여
 * 각 지역의 거래 ID를 legacy-transactions에 저장합니다.
 */
import { logger } from '@/app/api/shared/utils/logger';

import { NextResponse } from 'next/server';

import { getRegionCodes } from './services/regionService';
import { saveTransactionArchive } from './services/transactionArchiveService';
import {
  fetchTransactionsFromApi,
  getCurrentMonth,
  getLastMonth,
} from './services/transactionFetcher';

/**
 * GET 핸들러
 */
export async function GET() {
  const startedAt = new Date();
  logger.info('Batch job started', { startedAt: startedAt.toISOString() });

  try {
    const regionCodes = getRegionCodes();
    const currentMonth = getCurrentMonth();
    const lastMonth = getLastMonth();

    logger.info('Batch configuration', {
      totalRegions: regionCodes.length,
      months: [currentMonth, lastMonth],
    });

    let successCount = 0;
    let failureCount = 0;
    let totalArchived = 0;

    // 각 지역별 처리 (두 달 데이터를 한 번에 저장)
    for (const regionCode of regionCodes) {
      try {
        logger.info('Processing region', { regionCode });

        // 두 달 데이터 조회
        const idsCurrentMonth = await fetchTransactionsFromApi(
          regionCode,
          currentMonth
        );
        const idsLastMonth = await fetchTransactionsFromApi(
          regionCode,
          lastMonth
        );

        // 두 달 데이터 병합
        const allTransactionIds = [...idsCurrentMonth, ...idsLastMonth];

        // 한 번에 저장
        await saveTransactionArchive(regionCode, allTransactionIds);

        successCount++;
        totalArchived += allTransactionIds.length;

        logger.info('Region processed', {
          regionCode,
          currentMonthCount: idsCurrentMonth.length,
          lastMonthCount: idsLastMonth.length,
          totalCount: allTransactionIds.length,
        });
      } catch (error) {
        failureCount++;
        logger.error('Failed to process region', {
          regionCode,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const completedAt = new Date();
    const duration = completedAt.getTime() - startedAt.getTime();
    const response = {
      success: true,
      successCount,
      failureCount,
      totalArchived,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: duration,
    };

    logger.info('Batch job completed', response);
    return NextResponse.json(response);
  } catch (error) {
    const completedAt = new Date();

    logger.error('Batch job failed', {
      error: error instanceof Error ? error.message : String(error),
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
