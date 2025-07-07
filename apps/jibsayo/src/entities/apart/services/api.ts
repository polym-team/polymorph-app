import { ApartItem } from '../models/types';

// API 응답 타입들
interface FavoriteApart {
  id?: string;
  regionCode: string;
  address: string;
  apartName: string;
  deviceId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 즐겨찾기 아파트 목록 조회
export const fetchFavoriteApartList = async (
  deviceId: string
): Promise<FavoriteApart[]> => {
  try {
    const response = await fetch(`/api/favorite-apart?deviceId=${deviceId}`);
    const result: ApiResponse<FavoriteApart[]> = await response.json();

    if (!result.success) {
      throw new Error(result.error || '즐겨찾기 목록 조회에 실패했습니다.');
    }

    return result.data || [];
  } catch (error) {
    console.error('즐겨찾기 목록 조회 실패:', error);
    throw error;
  }
};

// 즐겨찾기 아파트 추가
export const addFavoriteApart = async (
  deviceId: string,
  regionCode: string,
  apartItem: ApartItem
): Promise<FavoriteApart> => {
  try {
    const response = await fetch('/api/favorite-apart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceId,
        regionCode,
        address: apartItem.address,
        apartName: apartItem.apartName,
      }),
    });

    const result: ApiResponse<FavoriteApart> = await response.json();

    if (!result.success) {
      throw new Error(result.error || '즐겨찾기 추가에 실패했습니다.');
    }

    return result.data!;
  } catch (error) {
    console.error('즐겨찾기 추가 실패:', error);
    throw error;
  }
};

// 즐겨찾기 아파트 삭제
export const removeFavoriteApart = async (
  deviceId: string,
  regionCode: string,
  apartItem: ApartItem
): Promise<void> => {
  try {
    const params = new URLSearchParams({
      deviceId,
      regionCode,
      address: apartItem.address,
      apartName: apartItem.apartName,
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
