import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { getItem, setItem } from '@/shared/lib/localStorage';

import { useEffect, useState } from 'react';

import { SortingState } from '@package/ui';

import { TransactionViewSetting } from '../models/types';

const defaultSettings: TransactionViewSetting = {
  sorting: [],
  pageSize: 10,
};

export const useTransactionViewSetting = () => {
  const [settings, setSettings] =
    useState<TransactionViewSetting>(defaultSettings);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // 클라이언트에서만 localStorage에 접근
    const loadSettings = async () => {
      setIsMounted(true);

      const savedSettings = getItem<TransactionViewSetting>(
        STORAGE_KEY.TRANSACTION_LIST_VIEW_SETTINGS
      );

      if (savedSettings) {
        setSettings(savedSettings);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = (newSettings: Partial<TransactionViewSetting>) => {
    const updatedSettings = { ...settings, ...newSettings };

    setSettings(updatedSettings);

    // isMounted 상태에서만 localStorage에 저장
    if (isMounted) {
      setItem(STORAGE_KEY.TRANSACTION_LIST_VIEW_SETTINGS, updatedSettings);
    }
  };

  const updateSorting = (sorting: SortingState) => {
    saveSettings({ sorting });
  };

  const updatePageSize = (pageSize: number) => {
    saveSettings({ pageSize });
  };

  return {
    sorting: settings.sorting,
    pageSize: settings.pageSize,
    updateSorting,
    updatePageSize,
    isMounted, // 클라이언트 마운트 여부를 알려주는 플래그
  };
};
