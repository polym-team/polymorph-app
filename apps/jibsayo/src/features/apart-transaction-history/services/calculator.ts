import { ApartDetailTradeHistoryItem } from '@/app/api/apart/models/types';
import { calculateAreaPyeong } from '@/shared/services/transactionService';

export const calculateSizes = (
  tradeItems: ApartDetailTradeHistoryItem[]
): number[] => {
  const sizes = Array.from(
    new Set(tradeItems.map(item => calculateAreaPyeong(item.size)))
  );
  return sizes.sort((a, b) => a - b);
};
