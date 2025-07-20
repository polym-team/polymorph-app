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
  const [settings, setSettings] = useState<TransactionViewSetting>({
    sorting: [],
    pageSize: 10,
    pageIndex: 0,
  });

  // URL 업데이트 중인지 추적하는 플래그
  const isUpdatingUrl = useRef(false);

  // 쿼리파라미터에서 pageIndex 읽어오기
  const getPageIndexFromParams = (): number => {
    const pageIndex = navigationSearchParams.get('pageIndex');
    return pageIndex ? parseInt(pageIndex, 10) : 0;
  };

  useEffect(() => {
    const loadSettings = async () => {
      setIsMounted(true);

      const savedSettings = await getLocalItem<
        Omit<TransactionViewSetting, 'pageIndex'>
      >(STORAGE_KEY.TRANSACTION_LIST_VIEW_SETTINGS);

      const pageIndexFromParams = getPageIndexFromParams();

      if (savedSettings) {
        setSettings(prev => ({
          ...prev,
          sorting: savedSettings.sorting,
          pageSize: savedSettings.pageSize,
          pageIndex: pageIndexFromParams,
        }));
      } else {
        setSettings(prev => ({
          ...prev,
          pageIndex: pageIndexFromParams,
        }));
      }
    };

    loadSettings();
  }, []);

  // 쿼리파라미터와 pageIndex 동기화 (외부 URL 변경 감지용)
  useEffect(() => {
    console.log(
      '📡 useEffect triggered. isMounted:',
      isMounted,
      'isUpdatingUrl:',
      isUpdatingUrl.current
    );
    if (isMounted && !isUpdatingUrl.current) {
      const pageIndexFromParams = getPageIndexFromParams();
      console.log(
        '📡 pageIndexFromParams:',
        pageIndexFromParams,
        'current settings.pageIndex:',
        settings.pageIndex
      );
      if (settings.pageIndex !== pageIndexFromParams) {
        console.log('📡 updating settings pageIndex to:', pageIndexFromParams);
        setSettings(prev => ({
          ...prev,
          pageIndex: pageIndexFromParams,
        }));
      }
    }
    // URL 업데이트 플래그 리셋
    isUpdatingUrl.current = false;
  }, [navigationSearchParams, isMounted, settings.pageIndex]);

  const saveSettings = async (newSettings: Partial<TransactionViewSetting>) => {
    const updatedSettings = { ...settings, ...newSettings };
    console.log('💾 saveSettings:', newSettings, 'current settings:', settings);
    setSettings(updatedSettings);

    if (isMounted) {
      // sorting과 pageSize는 IndexedDB에 저장
      if ('sorting' in newSettings || 'pageSize' in newSettings) {
        await setLocalItem(STORAGE_KEY.TRANSACTION_LIST_VIEW_SETTINGS, {
          sorting: updatedSettings.sorting,
          pageSize: updatedSettings.pageSize,
        });
      }

      // pageIndex는 쿼리파라미터에 저장
      if ('pageIndex' in newSettings) {
        console.log(
          '🌐 updating URL with pageIndex:',
          updatedSettings.pageIndex
        );
        // URL 업데이트 중임을 표시
        isUpdatingUrl.current = true;

        const newParams: Record<string, string> = {};

        // 현재 URL의 모든 쿼리파라미터 유지
        navigationSearchParams.forEach((value, key) => {
          newParams[key] = value;
        });

        // pageIndex만 업데이트
        newParams.pageIndex = updatedSettings.pageIndex.toString();

        console.log('🌐 setSearchParams called with:', newParams);
        setSearchParams(newParams);
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
    pageIndex: isMounted ? settings.pageIndex : 0,
    updateSorting,
    updatePageSize,
    updatePageIndex,
  };
};
