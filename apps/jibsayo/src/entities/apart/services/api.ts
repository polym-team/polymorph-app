import { FavoriteApartItem, ServerFavoriteApart } from '../models/types';

// API 응답 타입들
interface ApiResponse<T> {
  success: boolean;
  error?: string;
  data?: T;
}

// 즐겨찾기 아파트 목록 조회
export const getFavoriteApartListFromServer = async (
  deviceId: string
): Promise<FavoriteApartItem[]> => {
  try {
    const response = await fetch(`/api/favorite-apart?deviceId=${deviceId}`);
    const result: ApiResponse<ServerFavoriteApart[]> = await response.json();

    if (!result.success) {
      throw new Error(result.error || '즐겨찾기 목록 조회에 실패했습니다.');
    }

    if (!result.data) {
      return [];
    }

    return result.data.map(item => ({
      regionCode: item.regionCode,
      apartName: item.apartName,
      address: item.address,
    }));
  } catch (error) {
    console.error('즐겨찾기 목록 조회 실패:', error);
    throw error;
  }
};

// 즐겨찾기 아파트 추가
export const addFavoriteApartToServer = async (
  deviceId: string,
  item: FavoriteApartItem
): Promise<void> => {
  try {
    const response = await fetch('/api/favorite-apart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceId,
        regionCode: item.regionCode,
        address: item.address,
        apartName: item.apartName,
      }),
    });

    const result: ApiResponse<ServerFavoriteApart> = await response.json();

    if (!result.success) {
      throw new Error(result.error || '즐겨찾기 추가에 실패했습니다.');
    }
  } catch (error) {
    console.error('즐겨찾기 추가 실패:', error);
    throw error;
  }
};

// 즐겨찾기 아파트 삭제
export const removeFavoriteApartToServer = async (
  deviceId: string,
  item: FavoriteApartItem
): Promise<void> => {
  try {
    const params = new URLSearchParams({
      deviceId,
      regionCode: item.regionCode,
      address: item.address,
      apartName: item.apartName,
    });

    const response = await fetch(`/api/favorite-apart?${params}`, {
      method: 'DELETE',
    });

    const result: ApiResponse<void> = await response.json();

    if (!result.success) {
      throw new Error(result.error || '즐겨찾기 삭제에 실패했습니다.');
    }
  } catch (error) {
    console.error('즐겨찾기 삭제 실패:', error);
    throw error;
  }
};
