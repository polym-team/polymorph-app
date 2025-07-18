import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { getItem, setItem } from '@/shared/lib/indexedDB';

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
import {
  ApartItem,
  FavoriteApartItem,
  LocalFavoriteApart,
  ServerFavoriteApart,
} from './types';

// 기존 로컬스토리지 데이터를 새로운 형식으로 마이그레이션
const migrateOldLocalStorageData = async (): Promise<LocalFavoriteApart[]> => {
  try {
    // 기존 FavoriteApartItem[] 형태로 저장된 데이터 확인
    const oldData = await getItem<FavoriteApartItem[]>(
      STORAGE_KEY.FAVORITE_APART_LIST
    );
    if (oldData && Array.isArray(oldData)) {
      // 새로운 형식으로 변환
      const newData = oldData.flatMap(region =>
        region.apartItems.map(item => ({
          regionCode: region.regionCode,
          address: item.address,
          apartName: item.apartName,
        }))
      );

      // 새로운 형식으로 저장
      await setItem(STORAGE_KEY.FAVORITE_APART_LIST, newData);

      // 기존 데이터 삭제 (선택사항)
      // localStorage.removeItem(STORAGE_KEY.FAVORITE_APART_LIST);

      return newData;
    }
  } catch (error) {
    console.warn('IndexedDB 마이그레이션 실패:', error);
  }

  return [];
};

// 서버 데이터를 로컬 형식으로 변환 (기존 FavoriteApartItem 구조 유지)
const convertServerDataToLocalFormat = (
  serverData: ServerFavoriteApart[]
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

// 서버 데이터를 로컬스토리지용 데이터로 변환
const convertServerToLocalStorage = (
  serverData: ServerFavoriteApart[]
): LocalFavoriteApart[] => {
  return serverData.map(({ regionCode, address, apartName }) => ({
    regionCode,
    address,
    apartName,
  }));
};

// 로컬스토리지 데이터를 FavoriteApartItem 구조로 변환
const convertLocalStorageToFavoriteApartItem = (
  localData: LocalFavoriteApart[]
): FavoriteApartItem[] => {
  const regionMap = new Map<string, FavoriteApartItem>();

  localData.forEach(item => {
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

// 로컬 상태만 업데이트 (로컬스토리지 저장 없음)
export const updateLocalStateOnly = (
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
      return sortFavoriteApartList(updatedList);
    }
  } else {
    const newList = createNewRegion(favoriteApartList, regionCode, apartItem);
    return sortFavoriteApartList(newList);
  }

  return favoriteApartList;
};

// 로컬 상태에서만 삭제 (로컬스토리지 저장 없음)
export const removeFromLocalStateOnly = (
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

  return sortFavoriteApartList(updatedList);
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

// IndexedDB에서 즐겨찾기 목록 로드
export const loadFavoriteApartListFromLocal = async (): Promise<
  FavoriteApartItem[]
> => {
  // 기존 데이터 마이그레이션 시도
  await migrateOldLocalStorageData();

  const localData =
    (await getItem<LocalFavoriteApart[]>(STORAGE_KEY.FAVORITE_APART_LIST)) ??
    [];
  return convertLocalStorageToFavoriteApartItem(localData);
};

// 서버에 즐겨찾기 추가
export const addFavoriteApartToServer = async (
  deviceId: string,
  regionCode: string,
  apartItem: ApartItem
): Promise<void> => {
  await addFavoriteApartApi(deviceId, regionCode, apartItem);
};

// IndexedDB에 즐겨찾기 추가
export const addFavoriteApartToLocal = async (
  favoriteApartList: FavoriteApartItem[],
  regionCode: string,
  apartItem: ApartItem
): Promise<FavoriteApartItem[]> => {
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

      // IndexedDB에 저장 (LocalFavoriteApart 형태로)
      const localData = sortedList.flatMap(region =>
        region.apartItems.map(item => ({
          regionCode: region.regionCode,
          address: item.address,
          apartName: item.apartName,
        }))
      );
      await setItem(STORAGE_KEY.FAVORITE_APART_LIST, localData);

      return sortedList;
    }
  } else {
    const newList = createNewRegion(favoriteApartList, regionCode, apartItem);
    const sortedList = sortFavoriteApartList(newList);

    // IndexedDB에 저장 (LocalFavoriteApart 형태로)
    const localData = sortedList.flatMap(region =>
      region.apartItems.map(item => ({
        regionCode: region.regionCode,
        address: item.address,
        apartName: item.apartName,
      }))
    );
    await setItem(STORAGE_KEY.FAVORITE_APART_LIST, localData);

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

// IndexedDB에서 즐겨찾기 삭제
export const removeFavoriteApartFromLocal = async (
  favoriteApartList: FavoriteApartItem[],
  regionCode: string,
  apartItem: ApartItem
): Promise<FavoriteApartItem[]> => {
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

  // IndexedDB에 저장 (LocalFavoriteApart 형태로)
  const localData = sortedList.flatMap(region =>
    region.apartItems.map(item => ({
      regionCode: region.regionCode,
      address: item.address,
      apartName: item.apartName,
    }))
  );
  await setItem(STORAGE_KEY.FAVORITE_APART_LIST, localData);

  return sortedList;
};
