import { useAuthStore } from '@/shared/stores/authStore';
import { useGlobalConfigStore } from '@/shared/stores/globalConfigStore';
import { useQuery } from '@tanstack/react-query';

import { getFavoriteApartList } from '../services/api';
import { FavoriteApartItem } from '../types/FavoriteApartItem';

/**
 * 즐겨찾기 목록 조회
 * - 웹(로그인): 쿠키 기반 서버 API
 * - 웹뷰(레거시): deviceId 기반 서버 API
 *   TODO: 네이티브 앱 출시 후 oauth 통합 재검토
 * - 비로그인 웹: 빈 목록 (UI에서 로그인 유도)
 */
export const useFavoriteApartListQuery = () => {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const authReady = useAuthStore(s => s.isReady);

  return useQuery({
    queryKey: ['favoriteApartList', isAuthenticated],
    queryFn: async (): Promise<FavoriteApartItem[]> => {
      const { isInApp, deviceId } = useGlobalConfigStore.getState();
      if (isInApp) return getFavoriteApartList(deviceId);
      if (isAuthenticated) return getFavoriteApartList('');
      return [];
    },
    enabled: authReady,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
  });
};
