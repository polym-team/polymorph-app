import { useCallback } from 'react';

import { toast } from '@package/ui';

import { useFavoriteApartListStore } from '../models/storage';
import { FavoriteApartItem } from '../models/types';
import { useAddFavoriteApartMutation } from './useAddFavoriteApartMutation';

export const useAddFavoriteApartHandler = (): ((
  item: FavoriteApartItem
) => Promise<void>) => {
  const favoriteApartList = useFavoriteApartListStore(
    state => state.favoriteApartList
  );
  const setFavoriteApartList = useFavoriteApartListStore(
    state => state.setFavoriteApartList
  );
  const { mutateAsync } = useAddFavoriteApartMutation();

  const addFavoriteApartHandler = useCallback(
    async (item: FavoriteApartItem) => {
      try {
        mutateAsync(item);
        setFavoriteApartList([...favoriteApartList, item]);
        toast.success(`${item.apartName} 아파트가 관심목록에 추가됐어요`);
      } catch {
        toast.error('즐겨찾기 추가에 실패했어요');
      }
    },
    [favoriteApartList, setFavoriteApartList, mutateAsync]
  );

  return addFavoriteApartHandler;
};
