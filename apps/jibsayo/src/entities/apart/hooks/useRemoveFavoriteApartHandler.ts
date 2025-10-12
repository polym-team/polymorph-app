import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { setItem } from '@/shared/lib/localStorage';
import { createApartItemKey } from '@/shared/services/transactionService';
import { useGlobalConfigStore } from '@/shared/stores/globalConfigStore';

import { useCallback } from 'react';

import { toast } from '@package/ui';

import { useFavoriteApartListStore } from '../models/storage';
import { FavoriteApartItem } from '../models/types';
import { removeFavoriteApartToServer } from '../services/api';

export const useRemoveFavoriteApartHandler = (): ((
  item: FavoriteApartItem
) => Promise<void>) => {
  const isInApp = useGlobalConfigStore(state => state.isInApp);
  const deviceId = useGlobalConfigStore(state => state.deviceId);
  const favoriteApartList = useFavoriteApartListStore(
    state => state.favoriteApartList
  );
  const setFavoriteApartList = useFavoriteApartListStore(
    state => state.setFavoriteApartList
  );

  const removeFavoriteApartHandler = useCallback(
    async (item: FavoriteApartItem) => {
      try {
        const afterFavoriteApartList = favoriteApartList.filter(
          savedItem =>
            createApartItemKey(savedItem) !== createApartItemKey(item)
        );

        if (isInApp) {
          await removeFavoriteApartToServer(deviceId, item);
        } else {
          setItem(STORAGE_KEY.FAVORITE_APART_LIST, afterFavoriteApartList);
        }

        setFavoriteApartList(afterFavoriteApartList);
        toast.success(`${item.apartName} 아파트가 즐겨찾기에서 삭제됐어요`);
      } catch {}
    },
    [deviceId, isInApp, favoriteApartList, setFavoriteApartList]
  );

  return removeFavoriteApartHandler;
};
