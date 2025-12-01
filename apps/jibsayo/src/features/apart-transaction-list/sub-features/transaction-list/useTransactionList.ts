import { ApartTransactionItem } from '@/entities/apart-transaction';
import { useNewTransactionListQuery } from '@/entities/transaction';

import { useEffect, useMemo, useState } from 'react';

import { SortingState } from '@package/ui';

import { useSelectedMonth } from '../../SelectedMonthContext';
import {
  calculateTargetPageIndex,
  convertToTransactionItem,
  sliceTransactionItems,
  sortTransactionItems,
} from './services';
import { Sorting, TransactionItemViewModel } from './types';

interface Params {
  regionCode: string;
  tradeItems: ApartTransactionItem[];
}

interface Return {
  sorting: Sorting;
  pageIndex: number;
  totalCount: number;
  transactionItems: TransactionItemViewModel[];
  changeSorting: (newSorting: SortingState) => void;
  changePageIndex: (newPageIndex: number) => void;
}

export const useTransactionList = ({
  regionCode,
  tradeItems,
}: Params): Return => {
  const { data: newTransactionListData } =
    useNewTransactionListQuery(regionCode);
  const { selectedMonth } = useSelectedMonth();

  const [sorting, setSorting] = useState<Sorting>([
    { id: 'tradeDate', desc: true },
  ]);
  const [pageIndex, setPageIndex] = useState<number>(0);

  useEffect(() => {
    const targetPageIndex = calculateTargetPageIndex({
      tradeItems,
      selectedMonth,
      sorting,
    });
    setPageIndex(targetPageIndex);
  }, [selectedMonth, tradeItems, sorting]);

  const totalCount = tradeItems.length;
  const newTransactionIdsSet = useMemo(
    () => new Set(newTransactionListData?.transactionIds.map(id => id) || []),
    [newTransactionListData]
  );

  const transactionItems = useMemo(() => {
    const sortedTransactionItems = sortTransactionItems({
      tradeItems,
      sorting,
    });
    const slicedTransactionItems = sliceTransactionItems({
      tradeItems: sortedTransactionItems,
      pageIndex,
    });
    const convertedTransactionItems = convertToTransactionItem({
      tradeItems: slicedTransactionItems,
      newTransactionIdsSet,
    });

    return convertedTransactionItems;
  }, [tradeItems, sorting, pageIndex, newTransactionIdsSet]);

  const changeSorting = (newSorting: SortingState) => {
    setSorting(newSorting as Sorting);
    setPageIndex(0);
  };

  const changePageIndex = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  return {
    sorting,
    pageIndex,
    totalCount,
    transactionItems,
    changeSorting,
    changePageIndex,
  };
};
