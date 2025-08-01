import { STORAGE_KEY } from '@/shared/consts/storageKey';

import { useEffect, useState } from 'react';

import { ColumnDef, SortingState } from '@package/ui';

// localStorage 헬퍼 함수들
const getItem = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn('localStorage getItem 실패:', error);
    return null;
  }
};

const setItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('localStorage setItem 실패:', error);
  }
};

interface TransactionViewSettings {
  sorting: SortingState;
  pageSize: number;
  pageIndex: number;
}

const DEFAULT_SETTINGS: TransactionViewSettings = {
  sorting: [{ id: 'tradeDate', desc: true }],
  pageSize: 20,
  pageIndex: 0,
};

export function useTransactionViewSetting() {
  const [sorting, setSorting] = useState<SortingState>(
    DEFAULT_SETTINGS.sorting
  );
  const [pageSize, setPageSize] = useState<number>(DEFAULT_SETTINGS.pageSize);
  const [pageIndex, setPageIndex] = useState<number>(
    DEFAULT_SETTINGS.pageIndex
  );

  // 초기 설정 로드
  useEffect(() => {
    const savedSettings = getItem<TransactionViewSettings>(
      STORAGE_KEY.TRANSACTION_LIST_VIEW_SETTINGS
    );

    if (savedSettings) {
      setSorting(savedSettings.sorting);
      setPageSize(savedSettings.pageSize);
      setPageIndex(savedSettings.pageIndex);
    }
  }, []);

  // 설정 저장 함수
  const saveSettings = (newSettings: Partial<TransactionViewSettings>) => {
    const currentSettings = {
      sorting,
      pageSize,
      pageIndex,
      ...newSettings,
    };

    setItem(STORAGE_KEY.TRANSACTION_LIST_VIEW_SETTINGS, currentSettings);
  };

  // 정렬 업데이트
  const updateSorting = (newSorting: SortingState) => {
    setSorting(newSorting);
    saveSettings({ sorting: newSorting });
  };

  // 페이지 크기 업데이트
  const updatePageSize = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0); // 페이지 크기가 변경되면 첫 페이지로 이동
    saveSettings({ pageSize: newPageSize, pageIndex: 0 });
  };

  // 페이지 인덱스 업데이트
  const updatePageIndex = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
    saveSettings({ pageIndex: newPageIndex });
  };

  return {
    sorting,
    pageSize,
    pageIndex,
    updateSorting,
    updatePageSize,
    updatePageIndex,
  };
}
