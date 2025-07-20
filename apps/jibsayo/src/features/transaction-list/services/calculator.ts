import { TransactionsResponse } from '@/app/api/transactions/types';

import { TransactionItem } from '../models/types';
import { formatSizeWithPyeong } from './formatter';

const extractPyeong = (exclusiveAreaInSquareMeters: number): number => {
  const formatted = formatSizeWithPyeong(exclusiveAreaInSquareMeters);
  const pyeongMatch = formatted.match(/^(\d+)평/);

  return pyeongMatch ? parseInt(pyeongMatch[1], 10) : 0;
};

// 평수 계산 함수 (면적을 평수로 변환) - 표시 로직과 동일하게 수정
export const calculatePyeong = (sizeInSquareMeters: number): number => {
  // extractPyeong 함수 사용하여 표시와 동일한 계산 방식 적용
  return extractPyeong(sizeInSquareMeters);
};

// 평수 범위 계산 함수
export const calculatePyeongRange = (
  transactions: TransactionItem[]
): { min: number; max: number } => {
  if (transactions.length === 0) {
    return { min: 0, max: 50 }; // 기본값
  }

  const pyeongValues = transactions
    .map(transaction => transaction.size)
    .filter((size): size is number => size !== null && size > 0)
    .map(size => {
      const pyeong = calculatePyeong(size);
      return pyeong >= 50 ? 50 : pyeong; // 50평 이상은 50평으로 처리
    });

  if (pyeongValues.length === 0) {
    return { min: 0, max: 50 }; // 기본값
  }

  const min = Math.min(...pyeongValues);
  const max = Math.max(...pyeongValues);

  return { min, max };
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
  transactions: TransactionItem[]
): number => {
  if (transactions.length === 0) return 0;

  const validTransactions = transactions.filter(
    transaction => transaction.size && transaction.size > 0
  );

  if (validTransactions.length === 0) return 0;

  const totalPricePerPyeong = validTransactions.reduce((sum, transaction) => {
    const pyeong = extractPyeong(transaction.size ?? 0);
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
