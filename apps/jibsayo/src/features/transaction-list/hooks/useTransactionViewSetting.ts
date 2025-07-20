import { useSearchParams } from '@/entities/transaction';
import { STORAGE_KEY } from '@/shared/consts/storageKey';
import {
  getItem as getLocalItem,
  setItem as setLocalItem,
} from '@/shared/lib/indexedDB';

import { useSearchParams as useNavigationSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { SortingState } from '@package/ui';

import { TransactionViewSetting } from '../models/types';

interface Return {
  sorting: SortingState;
  pageSize: number;
  pageIndex: number;
  updateSorting: (sorting: SortingState) => void;
  updatePageSize: (pageSize: number) => void;
  updatePageIndex: (pageIndex: number) => void;
}

export const useTransactionViewSetting = (): Return => {
  const { searchParams, setSearchParams } = useSearchParams();
  const navigationSearchParams = useNavigationSearchParams();

  const [isMounted, setIsMounted] = useState(false);
  const [settings, setSettings] = useState<
    Omit<TransactionViewSetting, 'pageIndex'>
  >({
    sorting: [],
    pageSize: 10,
  });

  // pageIndex는 항상 쿼리파라미터에서 직접 읽어오기
  const getPageIndexFromParams = (): number => {
    const pageIndex = navigationSearchParams.get('pageIndex');
    return pageIndex ? parseInt(pageIndex, 10) : 0;
  };

  // 실제 pageIndex 값 (쿼리파라미터에서 실시간으로 읽어옴)
  const currentPageIndex = getPageIndexFromParams();

  useEffect(() => {
    const loadSettings = async () => {
      setIsMounted(true);

      const savedSettings = await getLocalItem<
        Omit<TransactionViewSetting, 'pageIndex'>
      >(STORAGE_KEY.TRANSACTION_LIST_VIEW_SETTINGS);

      if (savedSettings) {
        setSettings({
          sorting: savedSettings.sorting,
          pageSize: savedSettings.pageSize,
        });
      }
    };

    loadSettings();
  }, []);

  // pageIndex는 쿼리파라미터에서 직접 읽으므로 동기화 불필요

  const saveSettings = async (newSettings: Partial<TransactionViewSetting>) => {
    console.log('💾 saveSettings:', newSettings, 'current settings:', settings);

    if (isMounted) {
      // pageIndex는 별도로 처리 (쿼리파라미터에 저장)
      if ('pageIndex' in newSettings && newSettings.pageIndex !== undefined) {
        console.log('🌐 updating URL with pageIndex:', newSettings.pageIndex);

        const newParams: Record<string, string> = {};

        // 현재 URL의 모든 쿼리파라미터 유지
        navigationSearchParams.forEach((value, key) => {
          newParams[key] = value;
        });

        // pageIndex만 업데이트
        newParams.pageIndex = newSettings.pageIndex.toString();

        console.log('🌐 setSearchParams called with:', newParams);
        setSearchParams(newParams);
      }

      // sorting과 pageSize는 로컬 상태 및 IndexedDB에 저장
      const otherSettings = { ...newSettings };
      delete otherSettings.pageIndex; // pageIndex 제외

      if (Object.keys(otherSettings).length > 0) {
        const updatedSettings = { ...settings, ...otherSettings };
        setSettings(updatedSettings);

        await setLocalItem(STORAGE_KEY.TRANSACTION_LIST_VIEW_SETTINGS, {
          sorting: updatedSettings.sorting,
          pageSize: updatedSettings.pageSize,
        });
      }
    }
  };

  const updateSorting = async (sorting: SortingState) => {
    await saveSettings({ sorting });
  };

  const updatePageSize = async (pageSize: number) => {
    await saveSettings({ pageSize });
  };

  const updatePageIndex = async (pageIndex: number) => {
    console.log('🔄 updatePageIndex called:', pageIndex);
    await saveSettings({ pageIndex });
  };

  return {
    sorting: isMounted ? settings.sorting : [],
    pageSize: isMounted ? settings.pageSize : 10,
    pageIndex: isMounted ? currentPageIndex : 0,
    updateSorting,
    updatePageSize,
    updatePageIndex,
  };
};
