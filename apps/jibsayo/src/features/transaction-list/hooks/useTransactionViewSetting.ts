import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { getItem, setItem } from '@/shared/lib/localStorage';

import { useEffect, useState } from 'react';

import { SortingState } from '@package/ui';

import { TransactionViewSetting } from '../models/types';

interface Return {
  sorting: SortingState;
  pageSize: number;
  updateSorting: (sorting: SortingState) => void;
  updatePageSize: (pageSize: number) => void;
}

export const useTransactionViewSetting = (): Return => {
  const [isMounted, setIsMounted] = useState(false);
  const [settings, setSettings] = useState<TransactionViewSetting>({
    sorting: [],
    pageSize: 10,
  });

  useEffect(() => {
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
    sorting: isMounted ? settings.sorting : [],
    pageSize: isMounted ? settings.pageSize : 10,
    updateSorting,
    updatePageSize,
  };
};
