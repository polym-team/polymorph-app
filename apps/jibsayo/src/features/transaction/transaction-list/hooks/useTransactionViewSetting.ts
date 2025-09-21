import { useSearchParams } from '@/entities/transaction';
import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { useOnceEffect } from '@/shared/hooks/useOnceEffect';
import { getItem, setItem } from '@/shared/lib/localStorage';

import {
  useSearchParams as useNavigationSearchParams,
  useRouter,
} from 'next/navigation';
import { useState } from 'react';

import { SortingState } from '@package/ui';

interface Return {
  sorting: SortingState;
  pageIndex: number;
  updateSorting: (newSorting: SortingState) => void;
  updatePageIndex: (newPageIndex: number) => void;
}

export const useTransactionViewSetting = (): Return => {
  const navigationSearchParams = useNavigationSearchParams();
  const router = useRouter();
  const { searchParams } = useSearchParams();

  const [pageIndex, setPageIndex] = useState<number>(0);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'tradeDate', desc: true },
  ] as SortingState);

  const setDefaultPageIndex = () => {
    setPageIndex(Number(searchParams.pageIndex) || 0);
  };

  const setDefaultSettings = () => {
    const savedSettings = getItem<{ sorting: SortingState }>(
      STORAGE_KEY.TRANSACTION_LIST_VIEW_SETTINGS
    );

    if (savedSettings) {
      setSorting(savedSettings.sorting);
    }
  };

  const updateUrlPageIndex = (newPageIndex: number) => {
    const newSearchParams = new URLSearchParams(navigationSearchParams);
    newSearchParams.set('pageIndex', newPageIndex.toString());
    router.push(`/transactions?${newSearchParams.toString()}`);
  };

  const updateSorting = (newSorting: SortingState) => {
    setSorting(newSorting);
    setItem(STORAGE_KEY.TRANSACTION_LIST_VIEW_SETTINGS, {
      sorting: newSorting,
    });
  };

  const updatePageIndex = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
    updateUrlPageIndex(newPageIndex);
  };

  useOnceEffect(true, () => {
    setDefaultPageIndex(), setDefaultSettings();
  });

  return {
    sorting,
    pageIndex,
    updateSorting,
    updatePageIndex,
  };
};
