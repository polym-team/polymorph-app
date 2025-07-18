import { STORAGE_KEY } from '@/shared/consts/storageKey';
import {
  getItem as getLocalItem,
  setItem as setLocalItem,
} from '@/shared/lib/indexedDB';
import {
  getItem as getSessionItem,
  setItem as setSessionItem,
} from '@/shared/lib/sessionStorage';

import { useEffect, useState } from 'react';

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
  const [isMounted, setIsMounted] = useState(false);
  const [settings, setSettings] = useState<TransactionViewSetting>({
    sorting: [],
    pageSize: 10,
    pageIndex: 0,
  });

  useEffect(() => {
    const loadSettings = async () => {
      setIsMounted(true);

      const savedSettings = await getLocalItem<
        Omit<TransactionViewSetting, 'pageIndex'>
      >(STORAGE_KEY.TRANSACTION_LIST_VIEW_SETTINGS);

      const savedPageIndex = getSessionItem<number>(
        STORAGE_KEY.TRANSACTION_LIST_PAGE
      );

      if (savedSettings) {
        setSettings(prev => ({
          ...prev,
          sorting: savedSettings.sorting,
          pageSize: savedSettings.pageSize,
        }));
      }

      if (savedPageIndex !== null) {
        setSettings(prev => ({
          ...prev,
          pageIndex: savedPageIndex,
        }));
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async (newSettings: Partial<TransactionViewSetting>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    if (isMounted) {
      // sorting과 pageSize는 IndexedDB에 저장
      if ('sorting' in newSettings || 'pageSize' in newSettings) {
        await setLocalItem(STORAGE_KEY.TRANSACTION_LIST_VIEW_SETTINGS, {
          sorting: updatedSettings.sorting,
          pageSize: updatedSettings.pageSize,
        });
      }

      // pageIndex는 sessionStorage에 저장
      if ('pageIndex' in newSettings) {
        setSessionItem(
          STORAGE_KEY.TRANSACTION_LIST_PAGE,
          updatedSettings.pageIndex
        );
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
