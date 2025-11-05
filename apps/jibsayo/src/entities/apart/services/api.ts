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
      apartId: item.id,
      regionCode: item.regionCode,
      apartName: item.apartName,
      address: item.address,
    }));
  } catch (error) {
    console.error('즐겨찾기 목록 조회 실패:', error);
    throw error;
  }
};

export const addFavoriteApart = async (
  deviceId: string,
  item: FavoriteApartItem
): Promise<void> => {
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
    throw new Error(result.error);
  }
};

export const removeFavoriteApart = async (
  deviceId: string,
  apartId: string
): Promise<void> => {
  const params = new URLSearchParams({ deviceId, apartId });
  const response = await fetch(`/api/favorite-apart?${params}`, {
    method: 'DELETE',
  });

  const result: ApiResponse<void> = await response.json();

  if (!result.success) {
    throw new Error(result.error);
  }
};
