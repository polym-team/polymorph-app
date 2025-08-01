import { getDeviceId, getDeviceIdSync } from '@/shared/lib/device';

import { useEffect, useState } from 'react';

import { toast } from '@package/ui';

import {
  addFavoriteApartToLocal,
  addFavoriteApartToServer,
  loadFavoriteApartListFromLocal,
  loadFavoriteApartListFromServer,
  removeFavoriteApartFromLocal,
  removeFavoriteApartFromServer,
  removeFromLocalStateOnly,
  updateLocalStateOnly,
} from '../models/favorite-storage';
import { ApartItem, FavoriteApartItem } from '../models/types';

// 전역 상태로 즐겨찾기 목록 관리
let globalFavoriteApartList: FavoriteApartItem[] = [];
let globalListeners: Set<() => void> = new Set();

// 전역 상태 업데이트 함수
const updateGlobalState = (newList: FavoriteApartItem[]) => {
  globalFavoriteApartList = newList;
  globalListeners.forEach(listener => listener());
};

// 전역 상태 구독 함수
const subscribeToGlobalState = (listener: () => void) => {
  globalListeners.add(listener);
  return () => {
    globalListeners.delete(listener);
  };
};

interface Return {
  favoriteApartList: FavoriteApartItem[];
  addFavoriteApart: (regionCode: string, apartItem: ApartItem) => void;
  removeFavoriteApart: (regionCode: string, apartItem: ApartItem) => void;
  refreshFavoriteApartList: () => Promise<void>;
}

export const useFavoriteApartList = (): Return => {
  const [favoriteApartList, setFavoriteApartList] = useState<
    FavoriteApartItem[]
  >(globalFavoriteApartList);

  useEffect(() => {
    // 전역 상태 구독
    const unsubscribe = subscribeToGlobalState(() => {
      setFavoriteApartList(globalFavoriteApartList);
    });

    // 초기 로드 (전역 상태가 비어있을 때만)
    if (globalFavoriteApartList.length === 0) {
      loadFavoriteApartList();
    } else {
      setFavoriteApartList(globalFavoriteApartList);
    }

    return unsubscribe;
  }, []);

  const loadFavoriteApartList = async () => {
    const deviceId = await getDeviceId();
    try {
      if (deviceId) {
        const serverData = await loadFavoriteApartListFromServer(deviceId);
        updateGlobalState(serverData);
      } else {
        const localData = await loadFavoriteApartListFromLocal();
        updateGlobalState(localData);
      }
    } catch (error) {
      console.error('즐겨찾기 목록 로드 실패:', error);
      const localData = await loadFavoriteApartListFromLocal();
      updateGlobalState(localData);
    }
  };

  const refreshFavoriteApartList = async () => {
    await loadFavoriteApartList();
  };

  const addFavoriteApart = async (regionCode: string, apartItem: ApartItem) => {
    const deviceId = await getDeviceId();
    try {
      if (deviceId) {
        await addFavoriteApartToServer(deviceId, regionCode, apartItem);
        const updatedList = updateLocalStateOnly(
          globalFavoriteApartList,
          regionCode,
          apartItem
        );
        updateGlobalState(updatedList);
      } else {
        const updatedList = await addFavoriteApartToLocal(
          globalFavoriteApartList,
          regionCode,
          apartItem
        );
        updateGlobalState(updatedList);
      }
      toast.success(`즐겨찾기에 추가되었습니다. (${apartItem.apartName})`);
    } catch (error) {
      console.error('즐겨찾기 추가 실패:', error);
      toast.error('즐겨찾기 추가에 실패했습니다.');
    }
  };

  const removeFavoriteApart = async (
    regionCode: string,
    apartItem: ApartItem
  ) => {
    const deviceId = await getDeviceId();
    try {
      if (deviceId) {
        await removeFavoriteApartFromServer(deviceId, regionCode, apartItem);
        const updatedList = removeFromLocalStateOnly(
          globalFavoriteApartList,
          regionCode,
          apartItem
        );
        updateGlobalState(updatedList);
      } else {
        const updatedList = await removeFavoriteApartFromLocal(
          globalFavoriteApartList,
          regionCode,
          apartItem
        );
        updateGlobalState(updatedList);
      }
      toast.success(`즐겨찾기에서 삭제되었습니다. (${apartItem.apartName})`);
    } catch (error) {
      console.error('즐겨찾기 삭제 실패:', error);
      toast.error('즐겨찾기 삭제에 실패했습니다.');
    }
  };

  return {
    favoriteApartList,
    addFavoriteApart,
    removeFavoriteApart,
    refreshFavoriteApartList,
  };
};
