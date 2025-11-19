/**
 * 거래 데이터 조회 및 날짜 관련 서비스
 */
import { logger } from '@/app/api/shared/utils/logger';

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
    logger.info('Fetching transactions from API', {
      regionCode,
      dealYearMonth,
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/transactions?area=${regionCode}&createDt=${dealYearMonth}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      logger.warn('Failed to fetch transactions from API', {
        regionCode,
        dealYearMonth,
        status: response.status,
      });
      return [];
    }

    const data = await response.json();
    const transactions = data.list || [];

    // transactionId만 추출
    const transactionIds = transactions
      .map((tx: any) => tx.transactionId || tx.id)
      .filter(Boolean);

    logger.info('Successfully fetched transactions', {
      regionCode,
      dealYearMonth,
      count: transactionIds.length,
    });

    return transactionIds;
  } catch (error) {
    logger.error('Error fetching transactions from API', {
      regionCode,
      dealYearMonth,
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
