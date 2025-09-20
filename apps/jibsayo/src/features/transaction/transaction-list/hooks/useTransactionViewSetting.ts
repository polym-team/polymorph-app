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

interface TransactionViewSettings {
  sorting: SortingState;
  pageSize: number;
}

const DEFAULT_SETTINGS = {
  sorting: [{ id: 'tradeDate', desc: true }] as SortingState,
  pageSize: 20,
};

export function useTransactionViewSetting() {
  const navigationSearchParams = useNavigationSearchParams();
  const router = useRouter();
  const { searchParams } = useSearchParams();

  const [sorting, setSorting] = useState<SortingState>(
    DEFAULT_SETTINGS.sorting
  );
  const [pageSize, setPageSize] = useState<number>(DEFAULT_SETTINGS.pageSize);
  const [pageIndex, setPageIndex] = useState<number>(0);

  const setDefaultPageIndex = () => {
    setPageIndex(Number(searchParams.pageIndex) || 0);
  };

  const setDefaultSettings = () => {
    const savedSettings = getItem<TransactionViewSettings>(
      STORAGE_KEY.TRANSACTION_LIST_VIEW_SETTINGS
    );

    if (savedSettings) {
      setSorting(savedSettings.sorting);
      setPageSize(savedSettings.pageSize);
    }
  };

  const saveSettings = (newSettings: Partial<TransactionViewSettings>) => {
    const currentSettings = {
      sorting,
      pageSize,
      ...newSettings,
    };

    setItem(STORAGE_KEY.TRANSACTION_LIST_VIEW_SETTINGS, currentSettings);
  };

  const updateUrlPageIndex = (newPageIndex: number) => {
    const newSearchParams = new URLSearchParams(navigationSearchParams);
    newSearchParams.set('pageIndex', newPageIndex.toString());
    router.push(`/transactions?${newSearchParams.toString()}`);
  };

  const updateSorting = (newSorting: SortingState) => {
    setSorting(newSorting);
    saveSettings({ sorting: newSorting });
  };

  const updatePageSize = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0);
    updateUrlPageIndex(0);
    saveSettings({ pageSize: newPageSize });
  };

  const updatePageIndex = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
    updateUrlPageIndex(newPageIndex); // URL도 함께 업데이트
  };

  useOnceEffect(true, () => {
    setDefaultPageIndex(), setDefaultSettings();
  });

  return {
    sorting,
    pageSize,
    pageIndex,
    updateSorting,
    updatePageSize,
    updatePageIndex,
  };
}
