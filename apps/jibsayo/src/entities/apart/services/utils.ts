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
  apartId: string
): boolean => {
  return region.apartItems.some(item => item.apartId === apartId);
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
  apartId: string
): FavoriteApartItem => {
  return {
    ...region,
    apartItems: region.apartItems.filter(item => item.apartId !== apartId),
  };
};
