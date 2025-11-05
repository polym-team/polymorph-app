import { useCallback } from 'react';

import { toast } from '@package/ui';

import { useFavoriteApartListStore } from '../models/storage';
import { FavoriteApartItem } from '../models/types';
import { useRemoveFavoriteApartMutation } from './useRemoveFavoriteApartMutation';

export const useRemoveFavoriteApartHandler = (): ((
  item: FavoriteApartItem
) => Promise<void>) => {
  const favoriteApartList = useFavoriteApartListStore(
    state => state.favoriteApartList
  );
  const setFavoriteApartList = useFavoriteApartListStore(
    state => state.setFavoriteApartList
  );
  const { mutateAsync } = useRemoveFavoriteApartMutation();

  const removeFavoriteApartHandler = useCallback(
    async (item: FavoriteApartItem) => {
      try {
        mutateAsync(item.apartId);
        setFavoriteApartList(
          favoriteApartList.filter(
            savedItem => savedItem.apartId !== item.apartId
          )
        );
        toast.success(`${item.apartName} 아파트가 관심목록에서 삭제됐어요`);
      } catch {
        toast.error('즐겨찾기 삭제에 실패했어요');
      }
    },
    [favoriteApartList, setFavoriteApartList, mutateAsync]
  );

  return removeFavoriteApartHandler;
};
