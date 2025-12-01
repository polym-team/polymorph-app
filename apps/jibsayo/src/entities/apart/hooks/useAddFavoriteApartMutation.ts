import { useGlobalConfigStore } from '@/shared/stores/globalConfigStore';
import { useMutation } from '@tanstack/react-query';

import { toast } from '@package/ui';

import { addFavoriteApart as addFavoriteApartToServer } from '../services/api';
import { addFavoriteApart as addFavoriteApartToStorage } from '../services/storage';
import { FavoriteApartItem } from '../types/FavoriteApartItem';
import { useFavoriteApartListQuery } from './useFavoriteApartListQuery';

export const useAddFavoriteApartMutation = () => {
  const { refetch: refetchFavoriteApartList } = useFavoriteApartListQuery();

  return useMutation({
    mutationFn: async (item: FavoriteApartItem) => {
      const isInApp = useGlobalConfigStore.getState().isInApp;
      const deviceId = useGlobalConfigStore.getState().deviceId;

      try {
        if (isInApp) {
          await addFavoriteApartToServer(deviceId, item);
        } else {
          addFavoriteApartToStorage(item);
        }

        toast.success(`${item.apartName} 아파트가 관심목록에 추가됐어요`);
        refetchFavoriteApartList();
      } catch {
        toast.error('즐겨찾기 추가에 실패했어요');
      }
    },
  });
};
