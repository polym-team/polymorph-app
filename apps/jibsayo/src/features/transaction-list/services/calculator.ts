import { TransactionsResponse } from '@/app/api/transactions/types';

import { formatSizeWithPyeong } from './formatter';

const extractPyeong = (exclusiveAreaInSquareMeters: number): number => {
  const formatted = formatSizeWithPyeong(exclusiveAreaInSquareMeters);
  // "25평(84.59㎡)" 형태에서 숫자만 추출
  const pyeongMatch = formatted.match(/^(\d+)평/);
  return pyeongMatch ? parseInt(pyeongMatch[1], 10) : 0;
};

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

export const calculateAveragePricePerPyeong = (
  transactions: TransactionsResponse['list']
): number => {
  if (transactions.length === 0) return 0;

  const validTransactions = transactions.filter(
    transaction => transaction.size && transaction.size > 0
  );

  if (validTransactions.length === 0) return 0;

  const totalPricePerPyeong = validTransactions.reduce((sum, transaction) => {
    const pyeong = extractPyeong(transaction.size);
    const pricePerPyeong = transaction.tradeAmount / pyeong;
    return sum + pricePerPyeong;
  }, 0);

  return Math.round(totalPricePerPyeong / validTransactions.length);
};

export const calculatePricePerPyeong = (
  tradeAmount: number,
  size: number
): number => {
  if (!size || size <= 0) return 0;
  const pyeong = extractPyeong(size);
  return Math.round(tradeAmount / pyeong);
};
