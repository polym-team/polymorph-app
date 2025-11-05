'use client';

import { ApartDetailResponse } from '@/app/api/apart/models/types';
import {
  useAddFavoriteApartHandler,
  useFavoriteApartList,
  useRemoveFavoriteApartHandler,
} from '@/entities/apart';

import { ApartInfoTable } from '../ui/ApartInfoTable';

interface ApartDetailInfoProps {
  data: ApartDetailResponse;
}

export function ApartDetailInfo({ data }: ApartDetailInfoProps) {
  const favoriteApartList = useFavoriteApartList();
  const addFavoriteApart = useAddFavoriteApartHandler();
  const removeFavoriteApart = useRemoveFavoriteApartHandler();
  const isFavorite = favoriteApartList.some(
    favoriteApartItem => favoriteApartItem.apartId === data.apartId
  );

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFavoriteApart(data);
    } else {
      addFavoriteApart(data);
    }
  };

  return (
    <ApartInfoTable
      isFavorite={isFavorite}
      data={data}
      onToggleFavorite={toggleFavorite}
    />
  );
}
