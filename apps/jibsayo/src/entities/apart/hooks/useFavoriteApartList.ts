import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { useOnceEffect } from '@/shared/hooks';
import { getItem, setItem } from '@/shared/lib/localStorage';
import { createApartItemKey } from '@/shared/services/transactionService';
import { useGlobalConfigStore } from '@/shared/stores/globalConfigStore';

import { useCallback, useMemo } from 'react';

import { toast } from '@package/ui';

import { useFavoriteApartListStore } from '../models/storage';
import { FavoriteApartItem } from '../models/types';
import {
  addFavoriteApartToServer,
  getFavoriteApartListFromServer,
  removeFavoriteApartToServer,
} from '../services/api';

let globalFavoriteApartList: FavoriteApartItem[] | null = null;

export const useFavoriteApartList = (): FavoriteApartItem[] => {
  const isInApp = useGlobalConfigStore(state => state.isInApp);
  const deviceId = useGlobalConfigStore(state => state.deviceId);
  const favoriteApartList = useFavoriteApartListStore(
    state => state.favoriteApartList
  );
  const setFavoriteApartList = useFavoriteApartListStore(
    state => state.setFavoriteApartList
  );

  const loadFavoriteApartList = async () => {
    if (globalFavoriteApartList) {
      setFavoriteApartList(globalFavoriteApartList);
      return;
    }

    const data = isInApp
      ? await getFavoriteApartListFromServer(deviceId)
      : (getItem<FavoriteApartItem[]>(STORAGE_KEY.FAVORITE_APART_LIST) ?? []);

    setFavoriteApartList(data);
  };

  const sortedFavoriteApartList = useMemo(() => {
    return favoriteApartList.sort((a, b) => {
      return `${a.regionCode}-${a.apartName}-${a.address}`.localeCompare(
        `${b.regionCode}-${b.apartName}-${b.address}`,
        'ko'
      );
    });
  }, [favoriteApartList]);

  useOnceEffect(true, () => {
    loadFavoriteApartList();
  });

  return sortedFavoriteApartList;
};

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
        toast.success('즐겨찾기에 추가됐어요');
      } catch {}
    },
    [favoriteApartList]
  );

  return addFavoriteApartHandler;
};

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
        toast.success('즐겨찾기에서 삭제됐어요');
      } catch {}
    },
    [favoriteApartList]
  );

  return removeFavoriteApartHandler;
};
