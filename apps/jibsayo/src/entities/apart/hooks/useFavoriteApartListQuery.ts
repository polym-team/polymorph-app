import { useGlobalConfigStore } from '@/shared/stores/globalConfigStore';
import { useQuery } from '@tanstack/react-query';

import { getFavoriteApartList as getFavoriteApartListFromServer } from '../services/api';
import { getFavoriteApartList as getFavoriteApartListFromStorage } from '../services/storage';

export const useFavoriteApartListQuery = () => {
  return useQuery({
    queryKey: ['favoriteApartList'],
    queryFn: () => {
      const isInApp = useGlobalConfigStore.getState().isInApp;
      const deviceId = useGlobalConfigStore.getState().deviceId;

      if (isInApp) {
        return getFavoriteApartListFromServer(deviceId);
      }

      return getFavoriteApartListFromStorage();
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
  });
};
