import { FavoriteApartItem, ServerFavoriteApart } from '../models/types';

// API 응답 타입들
interface ApiResponse<T> {
  success: boolean;
  error?: string;
  data?: T;
}

export const getFavoriteApartList = async (
  deviceId: string
): Promise<FavoriteApartItem[]> => {
  const response = await fetch(`/api/favorite-apart?deviceId=${deviceId}`);
  const result: ApiResponse<FavoriteApartItem[]> = await response.json();

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data ?? [];
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
