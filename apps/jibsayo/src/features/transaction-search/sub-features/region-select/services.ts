import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
  RegionItem,
} from '@/entities/region';

import { RegionItemViewModel } from './types';

export const sortFavoriteRegionsSet = (
  favoriteRegionsList: string[]
): string[] => {
  return favoriteRegionsList.sort((a, b) => {
    const nameA = `${getCityNameWithRegionCode(a)}${getRegionNameWithRegionCode(a)}`;
    const nameB = `${getCityNameWithRegionCode(b)}${getRegionNameWithRegionCode(b)}`;
    return nameA.localeCompare(nameB, 'ko');
  });
};

export const convertToRegionItems = (
  regionItems: RegionItem[],
  favoriteRegionsSet: Set<string>
): RegionItemViewModel[] => {
  return regionItems.map(item => ({
    ...item,
    isFavorite: favoriteRegionsSet.has(item.code),
  }));
};
