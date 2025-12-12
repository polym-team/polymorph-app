import { ApartTransactionItem } from '@/entities/apart-transaction';
import { useApartTransactionListQuery } from '@/entities/apart-transaction/useApartTransactionListQuery';

import { useEffect, useState } from 'react';

import { SortingState } from '@package/ui';

import { PeriodValue } from '../../types';
import { TRANSACTION_LIST_PAGE_SIZE } from './consts';
import { Sorting } from './types';

interface Params {
  apartId: number | null;
  selectedPeriod: PeriodValue;
}

interface Return {
  sorting: Sorting;
  pageIndex: number;
  totalCount: number;
  items: ApartTransactionItem[];
  years: number[];
  yearCounts: Record<number, number>;
  changeSorting: (newSorting: SortingState) => void;
  changePageIndex: (newPageIndex: number) => void;
  changeYear: (year: number) => void;
}

export const useTransactionList = ({
  apartId,
  selectedPeriod,
}: Params): Return => {
  const [sorting, setSorting] = useState<Sorting>([
    { id: 'dealDate', desc: true },
  ]);
  const [pageIndex, setPageIndex] = useState<number>(0);

  const { data } = useApartTransactionListQuery(
    {
      apartId: apartId!,
      pageIndex,
      pageSize: TRANSACTION_LIST_PAGE_SIZE,
      period: selectedPeriod,
      orderBy: sorting[0].id as keyof ApartTransactionItem,
      orderDirection: sorting[0].desc ? 'desc' : 'asc',
    },
    { enabled: !!apartId }
  );

  const totalCount = data?.totalCount ?? 0;
  const items = data?.transactions ?? [];

  const changeSorting = (newSorting: SortingState) => {
    setSorting(newSorting as Sorting);
    setPageIndex(0);
  };

  const changePageIndex = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  useEffect(() => {
    setPageIndex(0);
  }, [totalCount]);

  // const changeYear = (year: number) => {
  //   const dateSorting: Sorting = [{ id: 'tradeDate', desc: true }];
  //   setSorting(dateSorting);

  //   const targetPageIndex = calculateYearPageIndex({
  //     transactionItems,
  //     year,
  //     sorting: dateSorting,
  //   });
  //   setPageIndex(targetPageIndex);
  // };

  return {
    sorting,
    pageIndex,
    totalCount,
    items,
    years: [],
    yearCounts: {},
    changeSorting,
    changePageIndex,
    changeYear: () => {},
  };
};
