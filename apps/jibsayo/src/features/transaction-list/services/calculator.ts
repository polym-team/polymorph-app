import { TransactionsResponse } from '@/app/api/transactions/types';

/**
 * 거래가격 평균 계산
 */
export const calculateAveragePrice = (
  transactions: TransactionsResponse['list']
): number => {
  if (!transactions || transactions.length === 0) return 0;

  const total = transactions.reduce(
    (sum, transaction) => sum + transaction.tradeAmount,
    0
  );

  return Math.round(total / transactions.length);
};
