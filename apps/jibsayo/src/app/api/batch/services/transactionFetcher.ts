/**
 * 거래 데이터 조회 및 날짜 관련 서비스
 */
import { logger } from '@/app/api/shared/utils/logger';
import { fetchGovApiData } from '@/app/api/transactions/services/api';
import { convertGovApiItemToTransactions } from '@/app/api/transactions/services/converter';

/**
 * 현재 월 (YYYYMM)
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}${month}`;
}

/**
 * 지난 달 (YYYYMM)
 */
export function getLastMonth(): string {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}${month}`;
}

/**
 * 국토부 API에서 거래 데이터 조회
 * @param regionCode 지역코드
 * @param dealYearMonth 계약년월 (YYYYMM)
 * @returns 거래 ID 배열
 */
export async function fetchTransactionsFromApi(
  regionCode: string,
  dealYearMonth: string
): Promise<string[]> {
  try {
    logger.info('[fetchTransactionsFromApi] 거래 조회 시작', {
      regionCode,
      dealYearMonth,
    });

    const govApiItems = await fetchGovApiData(regionCode, dealYearMonth);
    const transactions = convertGovApiItemToTransactions(govApiItems, regionCode);

    const transactionIds = transactions
      .map((tx: any) => tx.transactionId || tx.id)
      .filter(Boolean);

    logger.info('[fetchTransactionsFromApi] 거래 조회 완료', {
      count: transactionIds.length,
      regionCode,
      dealYearMonth,
    });

    return transactionIds;
  } catch (error) {
    logger.error('[fetchTransactionsFromApi] 거래 조회 오류', {
      regionCode,
      dealYearMonth,
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
