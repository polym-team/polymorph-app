import { ApartDetailResponse } from '@/app/api/apart/models/types';
import { useNewTransactionListQuery } from '@/entities/transaction';

import { useMemo, useState } from 'react';

import { SortingState } from '@package/ui';

import { TradeItemViewModel } from '../models/types';
import { mapTradeHistoryItems } from '../services/mapper';

interface Params {
  regionCode: string;
  tradeItems: ApartDetailResponse['tradeItems'];
  filterMonth?: string | null;
}

interface Return {
  sorting: SortingState;
  mappedTradeItems: TradeItemViewModel[];
  changeSorting: (newSorting: SortingState) => void;
}

export const useTransactionHistoryTableData = ({
  regionCode,
  tradeItems,
  filterMonth,
}: Params): Return => {
  const { data: newTransactionData } = useNewTransactionListQuery(regionCode);

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'tradeDate', desc: true },
  ]);

  const newTransactionIds = useMemo(
    () => newTransactionData?.transactionIds || [],
    [newTransactionData]
  );

  const mappedTradeItems = useMemo(() => {
    const allItems = mapTradeHistoryItems({
      tradeItems,
      newTransactionIds,
    });

    // 필터 월이 있으면 해당 월의 데이터만 필터링
    if (filterMonth) {
      return allItems.filter(item => {
        const itemDate = new Date(item.tradeDate);
        const itemMonth = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
        return itemMonth === filterMonth;
      });
    }

    return allItems;
  }, [tradeItems, newTransactionIds, filterMonth]);

  const changeSorting = (newSorting: SortingState) => {
    setSorting(newSorting);
  };

  return {
    sorting,
    mappedTradeItems,
    changeSorting,
  };
};
