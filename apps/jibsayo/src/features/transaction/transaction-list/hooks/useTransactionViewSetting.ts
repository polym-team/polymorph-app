import { useSearchParams } from '@/entities/transaction';
import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { getItem, setItem } from '@/shared/lib/localStorage';

import { useState } from 'react';

import { SortingState } from '@package/ui';

interface Return {
  sorting: SortingState;
  pageIndex: number;
  updateSorting: (newSorting: SortingState) => void;
  updatePageIndex: (newPageIndex: number) => void;
}

export const useTransactionViewSetting = (): Return => {
  const { searchParams, setSearchParams } = useSearchParams();

  const [sorting, setSorting] = useState<SortingState>(() => {
    const savedSettings = getItem<{ sorting: SortingState }>(
      STORAGE_KEY.TRANSACTION_LIST_VIEW_SETTINGS
    );

    return savedSettings?.sorting ?? [{ id: 'tradeDate', desc: true }];
  });

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

  return {
    sorting,
    pageIndex,
    updateSorting,
    updatePageIndex,
  };
};
