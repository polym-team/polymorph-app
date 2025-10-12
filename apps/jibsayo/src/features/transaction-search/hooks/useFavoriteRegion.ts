import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { useOnceEffect } from '@/shared/hooks';
import { getItem, setItem } from '@/shared/lib/localStorage';

import { useState } from 'react';

import { toast } from '@package/ui';

interface Return {
  favoriteRegionList: string[];
  addFavoriteRegion: (regionCode: string) => void;
  removeFavoriteRegion: (regionCode: string) => void;
}

export const useFavoriteRegion = (): Return => {
  const [favoriteRegionList, setFavoriteRegionList] = useState<string[]>([]);

  useOnceEffect(true, () => {
    const savedList = getItem<string[]>(STORAGE_KEY.FAVORITE_REGION_LIST);

    if (savedList) {
      setFavoriteRegionList(savedList);
    }
  });

  const addFavoriteRegion = (regionCode: string) => {
    if (!favoriteRegionList.includes(regionCode)) {
      const newList = [...favoriteRegionList, regionCode].sort((a, b) => {
        const nameA = `${getCityNameWithRegionCode(a)}${getRegionNameWithRegionCode(a)}`;
        const nameB = `${getCityNameWithRegionCode(b)}${getRegionNameWithRegionCode(b)}`;
        return nameA.localeCompare(nameB, 'ko');
      });
      setFavoriteRegionList(newList);
      setItem(STORAGE_KEY.FAVORITE_REGION_LIST, newList);
      toast.success(
        `${getCityNameWithRegionCode(regionCode)} ${getRegionNameWithRegionCode(regionCode)} 지역이 즐겨찾기에 추가됐어요`
      );
    }
  };

  const removeFavoriteRegion = (regionCode: string) => {
    const newList = favoriteRegionList.filter(code => code !== regionCode);
    setFavoriteRegionList(newList);
    setItem(STORAGE_KEY.FAVORITE_REGION_LIST, newList);
    toast.success(
      `${getCityNameWithRegionCode(regionCode)} ${getRegionNameWithRegionCode(regionCode)} 지역이 즐겨찾기에서 삭제됐어요`
    );
  };

  return {
    favoriteRegionList,
    addFavoriteRegion,
    removeFavoriteRegion,
  };
};
