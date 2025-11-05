import { useCallback } from 'react';

import { toast } from '@package/ui';

import { FavoriteApartItem } from '../models/types';
import { useFavoriteApartListQuery } from './useFavoriteApartListQuery';
import { useRemoveFavoriteApartMutation } from './useRemoveFavoriteApartMutation';

export const useRemoveFavoriteApartHandler = (): ((
  item: FavoriteApartItem
) => Promise<void>) => {
  const { mutateAsync } = useRemoveFavoriteApartMutation();
  const { refetch: refetchFavoriteApartList } = useFavoriteApartListQuery();

  const removeFavoriteApartHandler = useCallback(
    async (item: FavoriteApartItem) => {
      try {
        await mutateAsync(item.apartId);
        refetchFavoriteApartList();
        toast.success(`${item.apartName} 아파트가 관심목록에서 삭제됐어요`);
      } catch {
        toast.error('즐겨찾기 삭제에 실패했어요');
      }
    },
    [mutateAsync, refetchFavoriteApartList]
  );

  return removeFavoriteApartHandler;
};
