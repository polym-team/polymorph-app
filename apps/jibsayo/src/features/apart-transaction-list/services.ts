import { ApartTransactionItem } from '@/entities/apart-transaction';
import { calculateAreaPyeong } from '@/entities/transaction';

export const calculateAllSizes = (
  transactionItems: ApartTransactionItem[]
): number[] => {
  const allSizes = Array.from(
    new Set(transactionItems.map(item => calculateAreaPyeong(item.size)))
  );
  return allSizes.sort((a, b) => a - b);
};
