import { ApartDetailResponse } from '@/app/api/apart/types';
import { useNewTransactionListQuery } from '@/entities/transaction';

import { useMemo, useState } from 'react';

import { SortingState } from '@package/ui';

import { TradeItemViewModel } from '../models/types';
import { filterNewTransactionList } from '../services/filter';
import { mapTradeHistoryItems } from '../services/mapper';

interface Params {
  apartName: string;
  regionCode: string;
  tradeItems: ApartDetailResponse['tradeItems'];
}

interface Return {
  sorting: SortingState;
  mappedTradeItems: TradeItemViewModel[];
  changeSorting: (newSorting: SortingState) => void;
}

export const useTransactionHistoryTableData = ({
  apartName,
  regionCode,
  tradeItems,
}: Params): Return => {
  const { data: newTransactionData } = useNewTransactionListQuery(regionCode);

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'tradeDate', desc: true },
  ]);

  const newTransactionList = useMemo(() => {
    return filterNewTransactionList(newTransactionData?.list || [], apartName);
  }, [newTransactionData?.list, apartName]);

  const mappedTradeItems = useMemo(() => {
    return mapTradeHistoryItems({ apartName, tradeItems, newTransactionList });
  }, [apartName, tradeItems, newTransactionList]);

  const changeSorting = (newSorting: SortingState) => {
    setSorting(newSorting);
  };

  return { sorting, mappedTradeItems, changeSorting };
};
