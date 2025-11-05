import { FavoriteApartItem } from '@/entities/apart/models/types';
import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';

import { RegionItem } from '../models/types';

const createApartItems = (
  regionCode: string,
  favoriteApartList: FavoriteApartItem[]
): FavoriteApartItem[] => {
  const apartItems = favoriteApartList.filter(
    item => item.regionCode === regionCode
  );

  return apartItems;
};

const createRegionItems = (
  favoriteApartList: FavoriteApartItem[]
): RegionItem[] => {
  const regionItems: RegionItem[] = [];
  const regionCodes = Array.from(
    new Set(favoriteApartList.map(item => item.regionCode))
  );

  regionCodes.forEach(regionCode => {
    regionItems.push({
      code: regionCode,
      name: `${getCityNameWithRegionCode(regionCode)}${getRegionNameWithRegionCode(regionCode)}`,
      apartItems: createApartItems(regionCode, favoriteApartList),
    });
  });

  const sortedRegionItems = regionItems.sort((a, b) => {
    return a.name.localeCompare(b.name, 'ko');
  });

  return sortedRegionItems;
};

export const calculateRegionItems = (
  favoriteApartList: FavoriteApartItem[]
): RegionItem[] => {
  const regionItems = createRegionItems(favoriteApartList);

  return regionItems;
};
