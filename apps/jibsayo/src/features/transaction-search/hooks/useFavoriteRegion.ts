import { STORAGE_KEY } from '@/shared/consts/storageKey';

import { useEffect, useState } from 'react';

// localStorage 헬퍼 함수들
const getItem = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn('localStorage getItem 실패:', error);
    return null;
  }
};

const setItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('localStorage setItem 실패:', error);
  }
};

interface Return {
  favoriteRegionList: string[];
  addFavoriteRegion: (regionCode: string) => void;
  removeFavoriteRegion: (regionCode: string) => void;
}

export const useFavoriteRegion = (): Return => {
  const [favoriteRegionList, setFavoriteRegionList] = useState<string[]>([]);

  useEffect(() => {
    const savedList = getItem<string[]>(STORAGE_KEY.FAVORITE_REGION_LIST);
    if (savedList) {
      setFavoriteRegionList(savedList);
    }
  }, []);

  const addFavoriteRegion = (regionCode: string) => {
    if (!favoriteRegionList.includes(regionCode)) {
      const newList = [...favoriteRegionList, regionCode];
      setFavoriteRegionList(newList);
      setItem(STORAGE_KEY.FAVORITE_REGION_LIST, newList);
    }
  };

  const removeFavoriteRegion = (regionCode: string) => {
    const newList = favoriteRegionList.filter(code => code !== regionCode);
    setFavoriteRegionList(newList);
    setItem(STORAGE_KEY.FAVORITE_REGION_LIST, newList);
  };

  return {
    favoriteRegionList,
    addFavoriteRegion,
    removeFavoriteRegion,
  };
};
