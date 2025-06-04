import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { getItem, setItem } from '@/shared/lib/localStorage';

import { useEffect, useState } from 'react';

import { ApartItem, FavoriteApartItem } from '../models/types';
import {
  addApartToExistingRegion,
  createNewRegion,
  findRegionIndex,
  isDuplicateApart,
  removeApartFromRegion,
  sortFavoriteApartList,
} from '../services/utils';

interface Return {
  favoriteApartList: FavoriteApartItem[];
  addFavoriteApart: (regionCode: string, apartItem: ApartItem) => void;
  removeFavoriteApart: (regionCode: string, apartId: string) => void;
}

export const useFavoriteApartList = (): Return => {
  const [favoriteApartList, setFavoriteApartList] = useState<
    FavoriteApartItem[]
  >([]);

  // 클라이언트에서만 localStorage에서 데이터 로드
  useEffect(() => {
    const savedList =
      getItem<FavoriteApartItem[]>(STORAGE_KEY.FAVORITE_APART_LIST) ?? [];

    setFavoriteApartList(savedList);
  }, []);

  const updateAndSave = (newList: FavoriteApartItem[]): void => {
    const sortedList = sortFavoriteApartList(newList);
    setFavoriteApartList(sortedList);
    setItem(STORAGE_KEY.FAVORITE_APART_LIST, sortedList);
  };

  const addFavoriteApart = (regionCode: string, apartItem: ApartItem) => {
    const existingRegionIndex = findRegionIndex(favoriteApartList, regionCode);

    if (existingRegionIndex >= 0) {
      const existingRegion = favoriteApartList[existingRegionIndex];

      if (!isDuplicateApart(existingRegion, apartItem.apartId)) {
        const updatedList = addApartToExistingRegion(
          favoriteApartList,
          existingRegionIndex,
          apartItem
        );
        updateAndSave(updatedList);
      }
    } else {
      const newList = createNewRegion(favoriteApartList, regionCode, apartItem);
      updateAndSave(newList);
    }
  };

  const removeFavoriteApart = (regionCode: string, apartId: string) => {
    const regionIndex = findRegionIndex(favoriteApartList, regionCode);

    if (regionIndex < 0) {
      return;
    }

    const updatedRegion = removeApartFromRegion(
      favoriteApartList[regionIndex],
      apartId
    );

    if (updatedRegion.apartItems.length === 0) {
      const updatedList = favoriteApartList.filter(
        (_, index) => index !== regionIndex
      );
      updateAndSave(updatedList);
    } else {
      const updatedList = [...favoriteApartList];
      updatedList[regionIndex] = updatedRegion;
      updateAndSave(updatedList);
    }
  };

  return {
    favoriteApartList,
    addFavoriteApart,
    removeFavoriteApart,
  };
};
