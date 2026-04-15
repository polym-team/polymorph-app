import { useAuthStore } from '@/shared/stores/authStore';
import { useGlobalConfigStore } from '@/shared/stores/globalConfigStore';
import { useMutation } from '@tanstack/react-query';

import { toast } from '@package/ui';

import { removeFavoriteApart } from '../services/api';
import { FavoriteApartItem } from '../types/FavoriteApartItem';
import { useFavoriteApartListQuery } from './useFavoriteApartListQuery';

export const useRemoveFavoriteApartMutation = () => {
  const { refetch: refetchFavoriteApartList } = useFavoriteApartListQuery();

  return useMutation({
    mutationFn: async (item: FavoriteApartItem) => {
      const { isInApp, deviceId } = useGlobalConfigStore.getState();
      const { isAuthenticated } = useAuthStore.getState();

      try {
        // 웹뷰: 기존 deviceId 흐름 (TODO: 네이티브 앱 출시 후 재검토)
        if (isInApp) {
          await removeFavoriteApart(deviceId, item.apartId);
        } else if (isAuthenticated) {
          await removeFavoriteApart('', item.apartId);
        } else {
          toast.error('로그인이 필요합니다');
          return;
        }

        toast.success(`${item.apartName} 아파트가 관심목록에서 삭제됐어요`);
        refetchFavoriteApartList();
      } catch {
        toast.error('즐겨찾기 삭제에 실패했어요');
      }
    },
  });
};
