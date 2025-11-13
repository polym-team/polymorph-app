import { useMemo } from 'react';

import { FavoriteApartItem } from '../models/types';
import { useFavoriteApartListQuery } from './useFavoriteApartListQuery';

export const useFavoriteApartList = (): FavoriteApartItem[] => {
  const { data = [] } = useFavoriteApartListQuery();

  const sortedFavoriteApartList = useMemo(() => {
    return data.sort((a, b) => {
      return `${a.regionCode}-${a.apartName}-${a.address}`.localeCompare(
        `${b.regionCode}-${b.apartName}-${b.address}`,
        'ko'
      );
    });
  }, [data]);

  return sortedFavoriteApartList;
};

export const useFavoriteApartLoading = (): boolean => {
  const { isLoading } = useFavoriteApartListQuery();
  return isLoading;
};
