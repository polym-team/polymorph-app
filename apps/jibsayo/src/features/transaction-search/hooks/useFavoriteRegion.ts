import { STORAGE_KEY } from '@/shared/consts/storageKet';
import { getItem, setItem } from '@/shared/lib/localStorage';

import { useState } from 'react';

import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '../services/region';

interface Return {
  favoriteRegions: string[];
  addFavoriteRegion: (regionCode: string) => void;
  removeFavoriteRegion: (regionCode: string) => void;
}

export const useFavoriteRegion = (): Return => {
  const [favoriteRegions, setFavoriteRegions] = useState<string[]>(
    getItem(STORAGE_KEY.FAVORITE_REGION_LIST) ?? []
  );

  const addFavoriteRegion = (regionCode: string) => {
    setFavoriteRegions(prev => {
      if (prev.includes(regionCode)) return prev;

      const newRegions = [...prev, regionCode];
      setItem(STORAGE_KEY.FAVORITE_REGION_LIST, newRegions);

      return newRegions.sort((a, b) => {
        const nameA = `${getCityNameWithRegionCode(a)} ${getRegionNameWithRegionCode(a)}`;
        const nameB = `${getCityNameWithRegionCode(b)} ${getRegionNameWithRegionCode(b)}`;
        return nameA.localeCompare(nameB);
      });
    });
  };

  const removeFavoriteRegion = (regionCode: string) => {
    setFavoriteRegions(prev => prev.filter(r => r !== regionCode));
  };

  return { favoriteRegions, addFavoriteRegion, removeFavoriteRegion };
};
