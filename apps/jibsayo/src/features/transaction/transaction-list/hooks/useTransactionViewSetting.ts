import { useSearchParams } from '@/entities/transaction';
import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { useOnceEffect } from '@/shared/hooks';
import { getItem, setItem } from '@/shared/lib/localStorage';

import { useState } from 'react';

import { SortingState } from '@package/ui';

interface Return {
  sorting: SortingState;
  pageIndex: number;
  updateSorting: (newSorting: SortingState) => void;
  updatePageIndex: (newPageIndex: number) => void;
}

const DEFAULT_SORTING: SortingState = [{ id: 'tradeDate', desc: true }];

export const useTransactionViewSetting = (): Return => {
  const { searchParams, setSearchParams } = useSearchParams();

  const [sorting, setSorting] = useState<SortingState>(DEFAULT_SORTING);

  const pageIndex = Number(searchParams.pageIndex) ?? 0;

  const updateSorting = (newSorting: SortingState) => {
    setSorting(newSorting);
    setItem(STORAGE_KEY.TRANSACTION_LIST_VIEW_SETTINGS, {
      sorting: newSorting,
    });
  };

  const updatePageIndex = (newPageIndex: number) => {
    setSearchParams({ pageIndex: newPageIndex });
  };

  useOnceEffect(true, () => {
    const savedSettings = getItem<{ sorting: SortingState }>(
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
