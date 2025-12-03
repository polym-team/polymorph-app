import { useGlobalConfigStore } from '@/shared/stores/globalConfigStore';
import { useMutation } from '@tanstack/react-query';

import { toast } from '@package/ui';

import { removeFavoriteApart as removeFavoriteApartToServer } from '../services/api';
import { removeFavoriteApart as removeFavoriteApartToStorage } from '../services/storage';
import { FavoriteApartItem } from '../types/FavoriteApartItem';
import { useFavoriteApartListQuery } from './useFavoriteApartListQuery';

export const useRemoveFavoriteApartMutation = () => {
  const { refetch: refetchFavoriteApartList } = useFavoriteApartListQuery();

  return useMutation({
    mutationFn: async (item: FavoriteApartItem) => {
      const isInApp = useGlobalConfigStore.getState().isInApp;
      const deviceId = useGlobalConfigStore.getState().deviceId;

      try {
        if (isInApp) {
          await removeFavoriteApartToServer(deviceId, item.apartToken);
        } else {
          removeFavoriteApartToStorage(item.apartToken);
        }

        toast.success(`${item.apartName} 아파트가 관심목록에서 삭제됐어요`);
        refetchFavoriteApartList();
      } catch {
        toast.error('즐겨찾기 삭제에 실패했어요');
      }
    },
  });
};
