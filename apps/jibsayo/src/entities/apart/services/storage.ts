import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { getItem, setItem } from '@/shared/lib/localStorage';

import { FavoriteApartItem } from '../models/types';

export const addFavoriteApart = (item: FavoriteApartItem) => {
  const currentFavoriteApartList =
    getItem<FavoriteApartItem[]>(STORAGE_KEY.FAVORITE_APART_LIST) ?? [];

  setItem(STORAGE_KEY.FAVORITE_APART_LIST, [...currentFavoriteApartList, item]);
};

export const removeFavoriteApart = (apartId: string) => {
  const currentFavoriteApartList =
    getItem<FavoriteApartItem[]>(STORAGE_KEY.FAVORITE_APART_LIST) ?? [];

  setItem(
    STORAGE_KEY.FAVORITE_APART_LIST,
    currentFavoriteApartList.filter(savedItem => savedItem.apartId !== apartId)
  );
};
