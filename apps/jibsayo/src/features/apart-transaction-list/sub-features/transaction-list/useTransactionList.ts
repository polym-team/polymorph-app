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
  transactionItems: ApartTransactionItem[];
}

interface Return {
  sorting: Sorting;
  pageIndex: number;
  totalCount: number;
  items: TransactionItemViewModel[];
  changeSorting: (newSorting: SortingState) => void;
  changePageIndex: (newPageIndex: number) => void;
}

export const useTransactionList = ({
  regionCode,
  transactionItems,
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
      transactionItems,
      selectedMonth,
      sorting,
    });
    setPageIndex(targetPageIndex);
  }, [selectedMonth, transactionItems, sorting]);

  const totalCount = transactionItems.length;
  const newTransactionIdsSet = useMemo(
    () => new Set(newTransactionListData?.transactionIds?.map(id => id) ?? []),
    [newTransactionListData]
  );

  const items = useMemo(() => {
    const sortedTransactionItems = sortTransactionItems({
      transactionItems,
      sorting,
    });
    const slicedTransactionItems = sliceTransactionItems({
      transactionItems: sortedTransactionItems,
      pageIndex,
    });
    const convertedTransactionItems = convertToTransactionItem({
      transactionItems: slicedTransactionItems,
      newTransactionIdsSet,
    });

    return convertedTransactionItems;
  }, [transactionItems, sorting, pageIndex, newTransactionIdsSet]);

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
    items,
    changeSorting,
    changePageIndex,
  };
};
