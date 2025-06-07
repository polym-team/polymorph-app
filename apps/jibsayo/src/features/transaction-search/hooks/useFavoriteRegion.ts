import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { getItem, setItem } from '@/shared/lib/localStorage';

import { useEffect, useState } from 'react';

import { toast } from '@package/ui';

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
    if (favoriteRegions.includes(regionCode)) {
      toast.error('이미 저장된 지역입니다.');
      return;
    }

    setFavoriteRegions(prev => {
      const newRegions = [...prev, regionCode];
      setItem(STORAGE_KEY.FAVORITE_REGION_LIST, newRegions);

      return newRegions.sort((a, b) => {
        const nameA = `${getCityNameWithRegionCode(a)} ${getRegionNameWithRegionCode(a)}`;
        const nameB = `${getCityNameWithRegionCode(b)} ${getRegionNameWithRegionCode(b)}`;
        return nameA.localeCompare(nameB);
      });
    });

    toast.success(
      `지역이 저장되었습니다. (${getCityNameWithRegionCode(regionCode)} ${getRegionNameWithRegionCode(regionCode)})`
    );
  };

  const removeFavoriteRegion = (regionCode: string) => {
    setFavoriteRegions(prev => {
      const newRegions = prev.filter(r => r !== regionCode);
      setItem(STORAGE_KEY.FAVORITE_REGION_LIST, newRegions);
      return newRegions;
    });

    toast.success(
      `지역이 삭제되었습니다. (${getCityNameWithRegionCode(regionCode)} ${getRegionNameWithRegionCode(regionCode)})`
    );
  };

  return { favoriteRegions, addFavoriteRegion, removeFavoriteRegion };
};
