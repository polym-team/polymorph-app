import { ApartDetailTradeHistoryItem } from '@/app/api/apart/types';
import { calculateAreaPyeong } from '@/shared/services/transactionService';

import { SizesValue } from '../models/types';

export const calculateSizes = (
  tradeItems: ApartDetailTradeHistoryItem[]
): SizesValue => {
  return new Set(tradeItems.map(item => calculateAreaPyeong(item.size)));
};
