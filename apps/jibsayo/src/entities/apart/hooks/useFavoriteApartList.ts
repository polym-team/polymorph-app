import { getDeviceId } from '@/shared/lib/device';

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

interface Return {
  favoriteApartList: FavoriteApartItem[];
  addFavoriteApart: (regionCode: string, apartItem: ApartItem) => void;
  removeFavoriteApart: (regionCode: string, apartItem: ApartItem) => void;
}

export const useFavoriteApartList = (): Return => {
  const [favoriteApartList, setFavoriteApartList] = useState<
    FavoriteApartItem[]
  >([]);

  useEffect(() => {
    loadFavoriteApartList();
  }, []);

  const loadFavoriteApartList = async () => {
    const deviceId = getDeviceId();
    try {
      if (deviceId) {
        const serverData = await loadFavoriteApartListFromServer(deviceId);
        setFavoriteApartList(serverData);
      } else {
        const localData = loadFavoriteApartListFromLocal();
        setFavoriteApartList(localData);
      }
    } catch (error) {
      console.error('즐겨찾기 목록 로드 실패:', error);
      const localData = loadFavoriteApartListFromLocal();
      setFavoriteApartList(localData);
    }
  };

  const addFavoriteApart = async (regionCode: string, apartItem: ApartItem) => {
    const deviceId = getDeviceId();
    try {
      if (deviceId) {
        await addFavoriteApartToServer(deviceId, regionCode, apartItem);
        const updatedList = updateLocalStateOnly(
          favoriteApartList,
          regionCode,
          apartItem
        );
        setFavoriteApartList(updatedList);
      } else {
        const updatedList = addFavoriteApartToLocal(
          favoriteApartList,
          regionCode,
          apartItem
        );
        setFavoriteApartList(updatedList);
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
    const deviceId = getDeviceId();
    try {
      if (deviceId) {
        await removeFavoriteApartFromServer(deviceId, regionCode, apartItem);
        const updatedList = removeFromLocalStateOnly(
          favoriteApartList,
          regionCode,
          apartItem
        );
        setFavoriteApartList(updatedList);
      } else {
        const updatedList = removeFavoriteApartFromLocal(
          favoriteApartList,
          regionCode,
          apartItem
        );
        setFavoriteApartList(updatedList);
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
  };
};
