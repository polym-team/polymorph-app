import { useTransactionPageSearchParams } from '@/entities/transaction';
import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { useOnceEffect } from '@/shared/hooks';
import { getItem, setItem } from '@/shared/lib/localStorage';

import { useState } from 'react';

import { Sorting } from '../models/types';

interface Return {
  sorting: Sorting;
  pageIndex: number;
  updateSorting: (newSorting: Sorting) => void;
  updatePageIndex: (newPageIndex: number) => void;
}

const DEFAULT_SORTING: Sorting = { id: 'tradeDate', desc: true };

export const useTransactionViewSetting = (): Return => {
  const { searchParams, setSearchParams } = useTransactionPageSearchParams();

  const [sorting, setSorting] = useState<Sorting>(DEFAULT_SORTING);

  const pageIndex = Number(searchParams.pageIndex) ?? 0;

  const updateSorting = (newSorting: Sorting) => {
    setSorting(newSorting);
    setItem(STORAGE_KEY.TRANSACTION_LIST_VIEW_SETTINGS, {
      sorting: newSorting,
    });
  };

  const updatePageIndex = (newPageIndex: number) => {
    setSearchParams({ pageIndex: newPageIndex });
  };

  useOnceEffect(true, () => {
    const savedSettings = getItem<{ sorting: Sorting }>(
      STORAGE_KEY.TRANSACTION_LIST_VIEW_SETTINGS
    );

    setSorting(savedSettings?.sorting ?? DEFAULT_SORTING);
  });

  return {
    sorting,
    pageIndex,
    updateSorting,
    updatePageIndex,
  };
};
