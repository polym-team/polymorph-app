import {
  getCityNameWithRegionCode,
  type RegionItem,
  regionList,
} from '@/entities/region';

const isFavoritedRegion = (
  favoriteRegionList: string[],
  regionCode: string
): boolean => {
  return favoriteRegionList.includes(regionCode);
};

export const calculateNotFavoritedRegionList = (
  favoriteRegionList: string[],
  regionList: RegionItem[]
): RegionItem[] => {
  return regionList.filter(
    region => !isFavoritedRegion(favoriteRegionList, region.code)
  );
};

export const calculateFavoriteRegionList = (
  favoriteRegionList: string[]
): RegionItem[] => {
  return regionList
    .filter(region => isFavoritedRegion(favoriteRegionList, region.code))
    .map(region => ({
      ...region,
      name: `${getCityNameWithRegionCode(region.code)} ${region.name}`,
    }));
};

export const getDefaultDate = (): Date => {
  const today = new Date();
  const dayOfMonth = today.getDate();

  if (dayOfMonth < 10) {
    return new Date(today.getFullYear(), today.getMonth() - 1, 1);
  } else {
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }
};
