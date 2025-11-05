import { useGlobalConfigStore } from '@/shared/stores/globalConfigStore';
import { useMutation } from '@tanstack/react-query';

import { removeFavoriteApart as removeFavoriteApartToServer } from '../services/api';
import { removeFavoriteApart as removeFavoriteApartToStorage } from '../services/storage';

export const useRemoveFavoriteApartMutation = () => {
  return useMutation({
    mutationFn: async (apartId: string) => {
      const isInApp = useGlobalConfigStore.getState().isInApp;
      const deviceId = useGlobalConfigStore.getState().deviceId;

      if (isInApp) {
        await removeFavoriteApartToServer(deviceId, apartId);
      } else {
        removeFavoriteApartToStorage(apartId);
      }
    },
  });
};
