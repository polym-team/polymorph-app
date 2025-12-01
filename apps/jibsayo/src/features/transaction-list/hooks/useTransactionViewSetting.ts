import { useTransactionPageSearchParams } from '@/entities/transaction';
import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { useOnceEffect } from '@/shared/hooks/useOnceEffect';
import { getItem, setItem } from '@/shared/lib/localStorage';

import { useState } from 'react';

import { PageIndexState, SortingState } from '../types';

interface Return {
  sorting: SortingState;
  pageIndex: PageIndexState;
}

const DEFAULT_SORTING: SortingState['state'] = { id: 'tradeDate', desc: true };

export const useTransactionViewSetting = (): Return => {
  const { searchParams, setSearchParams } = useTransactionPageSearchParams();

  const [sorting, setSorting] =
    useState<SortingState['state']>(DEFAULT_SORTING);

  const pageIndex = Number(searchParams.pageIndex) ?? 0;

  const updateSorting = (newSorting: SortingState['state']) => {
    setSorting(newSorting);
    setItem(STORAGE_KEY.TRANSACTION_LIST_VIEW_SETTINGS, {
      sorting: newSorting,
    });
  };

  const updatePageIndex = (newPageIndex: number) => {
    setSearchParams({ pageIndex: newPageIndex });
  };

  useOnceEffect(true, () => {
    const savedSettings = getItem<{ sorting: SortingState['state'] }>(
      STORAGE_KEY.TRANSACTION_LIST_VIEW_SETTINGS
    );

    setSorting(savedSettings?.sorting ?? DEFAULT_SORTING);
  });

  return {
    sorting: { state: sorting, update: updateSorting },
    pageIndex: { state: pageIndex, update: updatePageIndex },
  };
};
