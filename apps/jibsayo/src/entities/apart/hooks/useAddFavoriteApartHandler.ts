import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { setItem } from '@/shared/lib/localStorage';
import { useGlobalConfigStore } from '@/shared/stores/globalConfigStore';

import { useCallback } from 'react';

import { toast } from '@package/ui';

import { useFavoriteApartListStore } from '../models/storage';
import { FavoriteApartItem } from '../models/types';
import { addFavoriteApartToServer } from '../services/api';

export const useAddFavoriteApartHandler = (): ((
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

  const addFavoriteApartHandler = useCallback(
    async (item: FavoriteApartItem) => {
      try {
        const afterFavoriteApartList = [...favoriteApartList, item];

        if (isInApp) {
          await addFavoriteApartToServer(deviceId, item);
        } else {
          setItem(STORAGE_KEY.FAVORITE_APART_LIST, afterFavoriteApartList);
        }

        setFavoriteApartList(afterFavoriteApartList);
        toast.success(`${item.apartName} 아파트가 관심목록에 추가됐어요`);
      } catch {}
    },
    [deviceId, isInApp, favoriteApartList, setFavoriteApartList]
  );

  return addFavoriteApartHandler;
};
