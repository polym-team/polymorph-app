import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { getItem, setItem } from '@/shared/lib/localStorage';

import { FavoriteApartItem } from '../types/FavoriteApartItem';

export const getFavoriteApartList = (): FavoriteApartItem[] => {
  return getItem<FavoriteApartItem[]>(STORAGE_KEY.FAVORITE_APART_LIST) ?? [];
};

export const addFavoriteApart = (item: FavoriteApartItem): void => {
  const currentFavoriteApartList =
    getItem<FavoriteApartItem[]>(STORAGE_KEY.FAVORITE_APART_LIST) ?? [];

  setItem(STORAGE_KEY.FAVORITE_APART_LIST, [...currentFavoriteApartList, item]);
};

export const removeFavoriteApart = (apartId: string): void => {
  const currentFavoriteApartList =
    getItem<FavoriteApartItem[]>(STORAGE_KEY.FAVORITE_APART_LIST) ?? [];

  setItem(
    STORAGE_KEY.FAVORITE_APART_LIST,
    currentFavoriteApartList.filter(savedItem => savedItem.apartId !== apartId)
  );
};
