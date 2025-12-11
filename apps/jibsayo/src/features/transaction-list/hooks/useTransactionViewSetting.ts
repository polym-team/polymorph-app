import { useTransactionPageSearchParams } from '@/entities/transaction';
import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { useOnceEffect } from '@/shared/hooks/useOnceEffect';
import { getItem, setItem } from '@/shared/lib/localStorage';

import { PageIndexState, SortingState } from '../types';

interface Return {
  sorting: SortingState;
  pageIndex: PageIndexState;
}

export const useTransactionViewSetting = (): Return => {
  const { searchParams, setSearchParams } = useTransactionPageSearchParams();

  const pageIndex = Number(searchParams.pageIndex) ?? 0;
  const sorting = {
    id: searchParams.orderBy,
    desc: searchParams.orderDirection === 'desc',
  };

  const updateSorting = (newSorting: SortingState['state']) => {
    setSearchParams({
      orderBy: newSorting.id,
      orderDirection: newSorting.desc ? 'desc' : 'asc',
    });
    setItem(STORAGE_KEY.TRANSACTION_LIST_VIEW_SETTINGS, {
      sorting: newSorting,
    });
  };

  const updatePageIndex = (newPageIndex: number) => {
    setSearchParams({ pageIndex: newPageIndex });
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

  return {
    sorting: { state: sorting, update: updateSorting },
    pageIndex: { state: pageIndex, update: updatePageIndex },
  };
};
