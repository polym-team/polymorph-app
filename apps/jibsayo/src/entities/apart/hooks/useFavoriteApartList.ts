import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { useOnceEffect } from '@/shared/hooks';
import { getItem } from '@/shared/lib/localStorage';
import { useGlobalConfigStore } from '@/shared/stores/globalConfigStore';

import { useMemo } from 'react';

import { useFavoriteApartListStore } from '../models/storage';
import { FavoriteApartItem } from '../models/types';
import { getFavoriteApartListFromServer } from '../services/api';

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
