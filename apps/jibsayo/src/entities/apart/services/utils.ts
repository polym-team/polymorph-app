import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region/lib/region';

import { ApartItem, FavoriteApartItem } from '../models/types';

export const findRegionIndex = (
  favoriteApartList: FavoriteApartItem[],
  regionCode: string
): number => {
  return favoriteApartList.findIndex(
    region => region.regionCode === regionCode
  );
};

export const isDuplicateApart = (
  region: FavoriteApartItem,
  apartName: string,
  address: string
): boolean => {
  return region.apartItems.some(
    item => item.apartName === apartName && item.address === address
  );
};

export const addApartToExistingRegion = (
  favoriteApartList: FavoriteApartItem[],
  regionIndex: number,
  apartItem: ApartItem
): FavoriteApartItem[] => {
  const existingRegion = favoriteApartList[regionIndex];
  const updatedRegion = {
    ...existingRegion,
    apartItems: [...existingRegion.apartItems, apartItem],
  };

  const nextList = [...favoriteApartList];
  nextList[regionIndex] = updatedRegion;
  return nextList;
};

export const createNewRegion = (
  favoriteApartList: FavoriteApartItem[],
  regionCode: string,
  apartItem: ApartItem
): FavoriteApartItem[] => {
  const newRegion: FavoriteApartItem = {
    regionCode,
    apartItems: [apartItem],
  };
  return [...favoriteApartList, newRegion];
};

export const removeApartFromRegion = (
  region: FavoriteApartItem,
  apartName: string,
  address: string
): FavoriteApartItem => {
  return {
    ...region,
    apartItems: region.apartItems.filter(
      item => !(item.apartName === apartName && item.address === address)
    ),
  };
};

export const sortFavoriteApartList = (
  list: FavoriteApartItem[]
): FavoriteApartItem[] => {
  return list
    .map(region => ({
      ...region,
      apartItems: [...region.apartItems].sort((a, b) =>
        a.apartName.localeCompare(b.apartName, 'ko')
      ),
    }))
    .sort((a, b) => {
      const nameA = `${getCityNameWithRegionCode(a.regionCode)}${getRegionNameWithRegionCode(a.regionCode)}`;
      const nameB = `${getCityNameWithRegionCode(b.regionCode)}${getRegionNameWithRegionCode(b.regionCode)}`;
      return nameA.localeCompare(nameB, 'ko');
    });
};
