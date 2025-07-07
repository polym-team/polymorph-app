import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { getItem, setItem } from '@/shared/lib/localStorage';

import {
  addFavoriteApart as addFavoriteApartApi,
  fetchFavoriteApartList,
  removeFavoriteApart as removeFavoriteApartApi,
} from '../services/api';
import {
  addApartToExistingRegion,
  createNewRegion,
  findRegionIndex,
  isDuplicateApart,
  removeApartFromRegion,
  sortFavoriteApartList,
} from '../services/utils';
import { ApartItem, FavoriteApartItem } from './types';

// 서버 데이터를 로컬 형식으로 변환
const convertServerDataToLocalFormat = (
  serverData: any[]
): FavoriteApartItem[] => {
  const regionMap = new Map<string, FavoriteApartItem>();

  serverData.forEach(item => {
    const { regionCode, apartName, address } = item;

    if (!regionMap.has(regionCode)) {
      regionMap.set(regionCode, {
        regionCode,
        apartItems: [],
      });
    }

    const region = regionMap.get(regionCode)!;
    region.apartItems.push({
      apartName,
      address,
    });
  });

  return Array.from(regionMap.values());
};

// 서버에서 즐겨찾기 목록 로드
export const loadFavoriteApartListFromServer = async (
  deviceId: string
): Promise<FavoriteApartItem[]> => {
  try {
    const serverData = await fetchFavoriteApartList(deviceId);
    return convertServerDataToLocalFormat(serverData);
  } catch (error) {
    console.error('서버에서 즐겨찾기 목록 로드 실패:', error);
    throw error;
  }
};

// 로컬스토리지에서 즐겨찾기 목록 로드
export const loadFavoriteApartListFromLocal = (): FavoriteApartItem[] => {
  return getItem<FavoriteApartItem[]>(STORAGE_KEY.FAVORITE_APART_LIST) ?? [];
};

// 서버에 즐겨찾기 추가
export const addFavoriteApartToServer = async (
  deviceId: string,
  regionCode: string,
  apartItem: ApartItem
): Promise<void> => {
  await addFavoriteApartApi(deviceId, regionCode, apartItem);
};

// 로컬스토리지에 즐겨찾기 추가
export const addFavoriteApartToLocal = (
  favoriteApartList: FavoriteApartItem[],
  regionCode: string,
  apartItem: ApartItem
): FavoriteApartItem[] => {
  const existingRegionIndex = findRegionIndex(favoriteApartList, regionCode);

  if (existingRegionIndex >= 0) {
    const existingRegion = favoriteApartList[existingRegionIndex];

    if (
      !isDuplicateApart(existingRegion, apartItem.apartName, apartItem.address)
    ) {
      const updatedList = addApartToExistingRegion(
        favoriteApartList,
        existingRegionIndex,
        apartItem
      );
      const sortedList = sortFavoriteApartList(updatedList);
      setItem(STORAGE_KEY.FAVORITE_APART_LIST, sortedList);
      return sortedList;
    }
  } else {
    const newList = createNewRegion(favoriteApartList, regionCode, apartItem);
    const sortedList = sortFavoriteApartList(newList);
    setItem(STORAGE_KEY.FAVORITE_APART_LIST, sortedList);
    return sortedList;
  }

  return favoriteApartList;
};

// 서버에서 즐겨찾기 삭제
export const removeFavoriteApartFromServer = async (
  deviceId: string,
  regionCode: string,
  apartItem: ApartItem
): Promise<void> => {
  await removeFavoriteApartApi(deviceId, regionCode, apartItem);
};

// 로컬스토리지에서 즐겨찾기 삭제
export const removeFavoriteApartFromLocal = (
  favoriteApartList: FavoriteApartItem[],
  regionCode: string,
  apartItem: ApartItem
): FavoriteApartItem[] => {
  const regionIndex = findRegionIndex(favoriteApartList, regionCode);

  if (regionIndex < 0) {
    return favoriteApartList;
  }

  const updatedRegion = removeApartFromRegion(
    favoriteApartList[regionIndex],
    apartItem.apartName,
    apartItem.address
  );

  let updatedList: FavoriteApartItem[];

  if (updatedRegion.apartItems.length === 0) {
    updatedList = favoriteApartList.filter((_, index) => index !== regionIndex);
  } else {
    updatedList = [...favoriteApartList];
    updatedList[regionIndex] = updatedRegion;
  }

  const sortedList = sortFavoriteApartList(updatedList);
  setItem(STORAGE_KEY.FAVORITE_APART_LIST, sortedList);
  return sortedList;
};
