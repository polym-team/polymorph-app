import { useGlobalConfigStore } from '@/shared/stores/globalConfigStore';
import { useMutation } from '@tanstack/react-query';

import { FavoriteApartItem } from '../models/types';
import { addFavoriteApart as addFavoriteApartToServer } from '../services/api';
import { addFavoriteApart as addFavoriteApartToStorage } from '../services/storage';

export const useAddFavoriteApartMutation = () => {
  return useMutation({
    mutationFn: async (item: FavoriteApartItem) => {
      const isInApp = useGlobalConfigStore.getState().isInApp;
      const deviceId = useGlobalConfigStore.getState().deviceId;

      if (isInApp) {
        await addFavoriteApartToServer(deviceId, item);
      } else {
        addFavoriteApartToStorage(item);
      }
    },
  });
};
