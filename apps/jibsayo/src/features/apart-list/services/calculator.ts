import { FavoriteApartItem } from '@/entities/apart/models/types';
import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';

import { ApartItem, RegionItem } from '../models/types';

const sortItems = <T extends { name: string }>(regionItems: T[]): T[] => {
  return regionItems.sort((a, b) => {
    return a.name.localeCompare(b.name, 'ko');
  });
};

const createApartItems = (
  regionCode: string,
  favoriteApartList: FavoriteApartItem[]
): ApartItem[] => {
  const apartItems = favoriteApartList
    .filter(item => item.regionCode === regionCode)
    .map(item => ({ name: item.apartName, address: item.address }));

  return sortItems(apartItems);
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

  return sortItems(regionItems);
};

export const calculateRegionItems = (
  favoriteApartList: FavoriteApartItem[]
): RegionItem[] => {
  const regionItems = createRegionItems(favoriteApartList);

  return regionItems;
};
