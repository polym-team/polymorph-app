import { ApartDetailResponse } from '@/app/api/apart/types';

import { useState } from 'react';

import { SortingState } from '@package/ui';

import { TradeItemWithPriceChangeRate } from '../models/types';
import { mapTradeItemsWithPriceChangeRate } from '../services/mapper';

interface Return {
  sorting: SortingState;
  mappedTradeItems: TradeItemWithPriceChangeRate[];
  changeSorting: (newSorting: SortingState) => void;
}

export const useTransactionHistoryTableData = (
  tradeItems: ApartDetailResponse['tradeItems']
): Return => {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'tradeDate', desc: true },
  ]);

  const mappedTradeItems = mapTradeItemsWithPriceChangeRate(tradeItems);

  const changeSorting = (newSorting: SortingState) => {
    setSorting(newSorting);
  };

  return { sorting, mappedTradeItems, changeSorting };
};
