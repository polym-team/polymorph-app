import { FavoriteApartItem } from '@/entities/apart/models/types';
import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';

import { RegionItem } from '../models/types';

const sortItems = <T extends { name: string }>(regionItems: T[]): T[] => {
  return regionItems.sort((a, b) => {
    return a.name.localeCompare(b.name, 'ko');
  });
};

const createApartItems = (
  regionItems: RegionItem[],
  favoriteApartList: FavoriteApartItem[]
): RegionItem[] => {
  regionItems.map(regionItem => {
    const apartItems = favoriteApartList
      .filter(item => item.regionCode === regionItem.code)
      .map(item => ({ name: item.apartName }));

    return {
      ...regionItem,
      apartItems: sortItems(apartItems),
    };
  });

  return regionItems;
};

const createRegionItems = (
  favoriteApartList: FavoriteApartItem[]
): RegionItem[] => {

  const regionCodes = [...new Set(favoriteApartList.map(item => item.regionCode))];
  const regionItems: RegionItem[] = [];

  favoriteApartList.forEach(item => {
    const regionItem = regionItems.find(
      regionItem => regionItem.code === item.regionCode
    );

    if (!regionItem) {
      regionItems.push({
        code: item.regionCode,
        name: `${getCityNameWithRegionCode(item.regionCode)}${getRegionNameWithRegionCode(item.regionCode)}`,
        apartItems: [],
      });
    }
  });

  return sortItems(regionItems);
};



export const calculateRegionItems = (
  favoriteApartList: FavoriteApartItem[]
): RegionItem[] => {
  const regionItems = createRegionItems(favoriteApartList);

  return regionItems;
};
