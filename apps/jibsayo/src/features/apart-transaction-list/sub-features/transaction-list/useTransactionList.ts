import { ApartTransactionItem } from '@/entities/apart-transaction';
import { useApartTransactionListQuery } from '@/entities/apart-transaction';
import { PageIndexByYear } from '@/entities/apart-transaction/types';

import { useEffect, useState } from 'react';

import { SortingState } from '@package/ui';

import { PeriodValue, SizesValue } from '../../types';
import { TRANSACTION_LIST_PAGE_SIZE } from './consts';
import { Sorting } from './types';

interface Params {
  apartId: number;
  allSizes: SizesValue;
  selectedSizes: SizesValue;
  selectedPeriod: PeriodValue;
}

interface Return {
  isFetching: boolean;
  sorting: Sorting;
  pageIndex: number;
  totalCount: number;
  pageIndexes: PageIndexByYear[];
  items: ApartTransactionItem[];
  changeSorting: (newSorting: SortingState) => void;
  changePageIndex: (newPageIndex: number) => void;
}

export const useTransactionList = ({
  apartId,
  allSizes,
  selectedSizes,
  selectedPeriod,
}: Params): Return => {
  const [sorting, setSorting] = useState<Sorting>([
    { id: 'dealDate', desc: true },
  ]);
  const [pageIndex, setPageIndex] = useState<number>(0);

  const { isFetching, data } = useApartTransactionListQuery({
    apartId,
    pageIndex,
    pageSize: TRANSACTION_LIST_PAGE_SIZE,
    sizes: allSizes.length === selectedSizes.length ? undefined : selectedSizes,
    period: selectedPeriod,
    orderBy: sorting[0].id as keyof ApartTransactionItem,
    orderDirection: sorting[0].desc ? 'desc' : 'asc',
  });

  const totalCount = data?.totalCount ?? 0;
  const pageIndexes = data?.pageIndexes ?? [];
  const items = data?.transactions ?? [];

  const changeSorting = (newSorting: SortingState) => {
    if (isFetching) return;

    setSorting(newSorting as Sorting);
    setPageIndex(0);
  };

  const changePageIndex = (newPageIndex: number) => {
    if (isFetching) return;

    setPageIndex(newPageIndex);
  };

  useEffect(() => {
    setPageIndex(0);
  }, [totalCount]);

  return {
    isFetching,
    sorting,
    pageIndex,
    totalCount,
    pageIndexes,
    items,
    changeSorting,
    changePageIndex,
  };
};
