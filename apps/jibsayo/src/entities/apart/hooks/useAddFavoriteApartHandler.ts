import { useCallback } from 'react';

import { toast } from '@package/ui';

import { FavoriteApartItem } from '../models/types';
import { useAddFavoriteApartMutation } from './useAddFavoriteApartMutation';
import { useFavoriteApartListQuery } from './useFavoriteApartListQuery';

export const useAddFavoriteApartHandler = (): ((
  item: FavoriteApartItem
) => Promise<void>) => {
  const { mutateAsync } = useAddFavoriteApartMutation();
  const { refetch: refetchFavoriteApartList } = useFavoriteApartListQuery();

  const addFavoriteApartHandler = useCallback(
    async (item: FavoriteApartItem) => {
      try {
        await mutateAsync(item);
        refetchFavoriteApartList();
        toast.success(`${item.apartName} 아파트가 관심목록에 추가됐어요`);
      } catch {
        toast.error('즐겨찾기 추가에 실패했어요');
      }
    },
    [mutateAsync, refetchFavoriteApartList]
  );

  return addFavoriteApartHandler;
};
