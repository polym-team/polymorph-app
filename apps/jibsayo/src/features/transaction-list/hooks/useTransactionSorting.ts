import {
  useTransactionListQuery,
  useTransactionPageSearchParams,
} from '@/entities/transaction';
import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { useOnceEffect } from '@/shared/hooks/useOnceEffect';
import { getItem, setItem } from '@/shared/lib/localStorage';

import { SortingState } from '../types';

export const useTransactionSorting = (): SortingState => {
  const { isLoading } = useTransactionListQuery();
  const { searchParams, setSearchParams } = useTransactionPageSearchParams();

  const sorting = {
    id: searchParams.orderBy,
    desc: searchParams.orderDirection === 'desc',
  };

  const updateSorting = (newSorting: SortingState['state']) => {
    if (isLoading) return;

    setSearchParams({
      orderBy: newSorting.id,
      orderDirection: newSorting.desc ? 'desc' : 'asc',
    });

    setItem(STORAGE_KEY.TRANSACTION_LIST_VIEW_SETTINGS, {
      sorting: newSorting,
    });
  };

  useOnceEffect(true, () => {
    const savedSettings = getItem<{ sorting: SortingState['state'] }>(
      STORAGE_KEY.TRANSACTION_LIST_VIEW_SETTINGS
    );

    if (savedSettings?.sorting) {
      setSearchParams({
        orderBy: savedSettings.sorting.id,
        orderDirection: savedSettings.sorting.desc ? 'desc' : 'asc',
      });
    }
  });

  return { state: sorting, update: updateSorting };
};
