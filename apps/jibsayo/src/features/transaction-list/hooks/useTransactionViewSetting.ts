import { STORAGE_KEY } from '@/shared/consts/storageKey';

import {
  useSearchParams as useNavigationSearchParams,
  useRouter,
} from 'next/navigation';
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
}

const DEFAULT_SETTINGS = {
  sorting: [{ id: 'tradeDate', desc: true }] as SortingState,
  pageSize: 20,
};

export function useTransactionViewSetting() {
  const navigationSearchParams = useNavigationSearchParams();
  const router = useRouter();

  const [sorting, setSorting] = useState<SortingState>(
    DEFAULT_SETTINGS.sorting
  );
  const [pageSize, setPageSize] = useState<number>(DEFAULT_SETTINGS.pageSize);
  const [pageIndex, setPageIndex] = useState<number>(0);

  // URL 쿼리 파라미터에서 pageIndex 읽기
  useEffect(() => {
    const urlPageIndex = navigationSearchParams.get('pageIndex');
    if (urlPageIndex !== null) {
      const parsedPageIndex = parseInt(urlPageIndex, 10);
      if (!isNaN(parsedPageIndex) && parsedPageIndex >= 0) {
        setPageIndex(parsedPageIndex);
      }
    } else {
      // URL에 pageIndex가 없으면 0으로 설정
      setPageIndex(0);
    }
  }, [navigationSearchParams]);

  // 초기 설정 로드 (정렬과 페이지 크기만 localStorage에서)
  useEffect(() => {
    const savedSettings = getItem<TransactionViewSettings>(
      STORAGE_KEY.TRANSACTION_LIST_VIEW_SETTINGS
    );

    if (savedSettings) {
      setSorting(savedSettings.sorting);
      setPageSize(savedSettings.pageSize);
    }
  }, []);

  // 설정 저장 함수 (pageIndex 제외)
  const saveSettings = (newSettings: Partial<TransactionViewSettings>) => {
    const currentSettings = {
      sorting,
      pageSize,
      ...newSettings,
    };

    setItem(STORAGE_KEY.TRANSACTION_LIST_VIEW_SETTINGS, currentSettings);
  };

  // URL 쿼리 파라미터 업데이트 함수
  const updateUrlPageIndex = (newPageIndex: number) => {
    const newSearchParams = new URLSearchParams(navigationSearchParams);
    newSearchParams.set('pageIndex', newPageIndex.toString());
    router.push(`/transactions?${newSearchParams.toString()}`);
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
    saveSettings({ pageSize: newPageSize });
    updateUrlPageIndex(0); // URL도 함께 업데이트
  };

  // 페이지 인덱스 업데이트
  const updatePageIndex = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
    updateUrlPageIndex(newPageIndex); // URL만 업데이트
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
