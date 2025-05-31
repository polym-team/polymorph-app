import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { getItem, setItem } from '@/shared/lib/localStorage';

import { useEffect, useState } from 'react';

interface Return {
  favoriteRegions: string[];
  addFavoriteRegion: (regionCode: string) => void;
  removeFavoriteRegion: (regionCode: string) => void;
}

export const useFavoriteRegion = (): Return => {
  const [favoriteRegions, setFavoriteRegions] = useState<string[]>([]);

  useEffect(() => {
    const savedRegions = getItem<string[]>(STORAGE_KEY.FAVORITE_REGION_LIST);
    if (savedRegions) {
      setFavoriteRegions(savedRegions);
    }
  }, []);

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
    setFavoriteRegions(prev => {
      const newRegions = prev.filter(r => r !== regionCode);
      setItem(STORAGE_KEY.FAVORITE_REGION_LIST, newRegions);
      return newRegions;
    });
  };

  return { favoriteRegions, addFavoriteRegion, removeFavoriteRegion };
};
