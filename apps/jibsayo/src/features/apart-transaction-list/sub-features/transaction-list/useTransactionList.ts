import { ApartTransactionItem } from '@/entities/apart-transaction';
import { useNewTransactionListQuery } from '@/entities/transaction';

import { useMemo, useState } from 'react';

import { SortingState } from '@package/ui';

import {
  calculateYearCounts,
  calculateYearPageIndex,
  convertToTransactionItem,
  extractTransactionYears,
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
  years: number[];
  yearCounts: Record<number, number>;
  changeSorting: (newSorting: SortingState) => void;
  changePageIndex: (newPageIndex: number) => void;
  changeYear: (year: number) => void;
}

export const useTransactionList = ({
  regionCode,
  transactionItems,
}: Params): Return => {
  const { data: newTransactionListData } =
    useNewTransactionListQuery(regionCode);

  const [sorting, setSorting] = useState<Sorting>([
    { id: 'tradeDate', desc: true },
  ]);
  const [pageIndex, setPageIndex] = useState<number>(0);

  const totalCount = transactionItems.length;
  const years = useMemo(
    () => extractTransactionYears({ transactionItems }),
    [transactionItems]
  );
  const yearCounts = useMemo(
    () => calculateYearCounts({ transactionItems }),
    [transactionItems]
  );
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

  const changeYear = (year: number) => {
    const dateSorting: Sorting = [{ id: 'tradeDate', desc: true }];
    setSorting(dateSorting);

    const targetPageIndex = calculateYearPageIndex({
      transactionItems,
      year,
      sorting: dateSorting,
    });
    setPageIndex(targetPageIndex);
  };

  return {
    sorting,
    pageIndex,
    totalCount,
    items,
    years,
    yearCounts,
    changeSorting,
    changePageIndex,
    changeYear,
  };
};
