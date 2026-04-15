import { FavoriteApartItem } from '../types/FavoriteApartItem';
import { FavoriteApartResponseInServer } from '../types/Server';

interface ApiResponse<T> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * 즐겨찾기 목록 조회
 * - deviceId 빈 문자열: 로그인 유저(쿠키 기반 인증)
 * - deviceId 있음: 웹뷰 레거시 흐름
 *   TODO: 네이티브 앱 출시 후 oauth 통합 재검토
 */
export const getFavoriteApartList = async (
  deviceId: string
): Promise<FavoriteApartItem[]> => {
  const url = deviceId
    ? `/api/favorite-apart?deviceId=${deviceId}`
    : '/api/favorite-apart';
  const response = await fetch(url);
  const result: ApiResponse<Array<{ apartToken?: string; apartName?: string; regionCode?: string }>> =
    await response.json();

  if (!result.success) {
    throw new Error(result.error);
  }

  return (result.data ?? []).map(d => ({
    apartId: Number(d.apartToken),
    apartName: d.apartName ?? '',
    regionCode: d.regionCode ?? '',
  }));
};

export const addFavoriteApart = async (
  deviceId: string,
  item: FavoriteApartItem
): Promise<void> => {
  const body: Record<string, unknown> = {
    apartToken: String(item.apartId),
    regionCode: item.regionCode,
    apartName: item.apartName,
  };
  if (deviceId) body.deviceId = deviceId;

  const response = await fetch('/api/favorite-apart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const result: ApiResponse<FavoriteApartResponseInServer> =
    await response.json();

  if (!result.success) {
    throw new Error(result.error);
  }
};

export const removeFavoriteApart = async (
  deviceId: string,
  apartId: number
): Promise<void> => {
  const params = new URLSearchParams({ apartToken: apartId.toString() });
  if (deviceId) params.set('deviceId', deviceId);
  const response = await fetch(`/api/favorite-apart?${params}`, {
    method: 'DELETE',
  });

  const result: ApiResponse<void> = await response.json();

  if (!result.success) {
    throw new Error(result.error);
  }
};
