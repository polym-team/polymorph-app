import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { getItem, setItem } from '@/shared/lib/indexedDB';

import { useEffect, useState } from 'react';

import { toast } from '@package/ui';

interface Return {
  favoriteRegions: string[];
  toggleFavoriteRegion: (regionCode: string) => void;
  removeFavoriteRegion: (regionCode: string) => void;
}

export const useFavoriteRegion = (): Return => {
  const [favoriteRegions, setFavoriteRegions] = useState<string[]>([]);

  useEffect(() => {
    const loadSavedRegions = async () => {
      const savedRegions = await getItem<string[]>(
        STORAGE_KEY.FAVORITE_REGION_LIST
      );
      if (savedRegions) {
        setFavoriteRegions(savedRegions);
      }
    };
    loadSavedRegions();
  }, []);

  const addFavoriteRegion = async (regionCode: string) => {
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

  const removeFavoriteRegion = async (regionCode: string) => {
    setFavoriteRegions(prev => {
      const newRegions = prev.filter(r => r !== regionCode);
      setItem(STORAGE_KEY.FAVORITE_REGION_LIST, newRegions);
      return newRegions;
    });

    toast.success(
      `지역이 삭제되었습니다. (${getCityNameWithRegionCode(regionCode)} ${getRegionNameWithRegionCode(regionCode)})`
    );
  };

  const toggleFavoriteRegion = async (regionCode: string) => {
    if (favoriteRegions.includes(regionCode)) {
      await removeFavoriteRegion(regionCode);
    } else {
      await addFavoriteRegion(regionCode);
    }
  };

  return { favoriteRegions, toggleFavoriteRegion, removeFavoriteRegion };
};
