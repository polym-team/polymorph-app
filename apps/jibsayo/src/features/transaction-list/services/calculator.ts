import { TransactionsResponse } from '@/app/api/transactions/types';

import { formatSizeWithPyeong } from './formatter';

const extractPyeong = (exclusiveAreaInSquareMeters: number): number => {
  const formatted = formatSizeWithPyeong(exclusiveAreaInSquareMeters);
  const pyeongMatch = formatted.match(/^(\d+)평/);

  return pyeongMatch ? parseInt(pyeongMatch[1], 10) : 0;
};

export const calculateAveragePrice = (
  transactions: TransactionsResponse['list']
): number => {
  if (transactions.length === 0) return 0;

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

export const calculateApartAdditionalInfo = ({
  buildedYear,
  floor,
  householdsNumber,
}: {
  buildedYear: number | null;
  floor: number | null;
  householdsNumber: number | null;
}): string => {
  const additionalInfoArr: string[] = [];

  if (buildedYear) additionalInfoArr.push(`${buildedYear}년식`);
  if (householdsNumber) additionalInfoArr.push(`${householdsNumber}세대`);
  if (floor) additionalInfoArr.push(`${floor}층`);

  if (additionalInfoArr.length === 0) return '';

  return `(${additionalInfoArr.join('/')})`;
};
