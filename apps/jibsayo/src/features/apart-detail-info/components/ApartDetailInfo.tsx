'use client';

import { ApartDetailResponse } from '@/app/api/apart/types';
import {
  useAddFavoriteApartHandler,
  useFavoriteApartList,
  useRemoveFavoriteApartHandler,
} from '@/entities/apart';
import { createApartItemKey } from '@/shared/services/transactionService';
import { removeSpecialCharacters } from '@/shared/utils/formatters';

import { ApartInfoTable } from '../ui/ApartInfoTable';

interface ApartDetailInfoProps {
  regionCode: string;
  apartName: string;
  data: ApartDetailResponse;
}

export function ApartDetailInfo({
  regionCode,
  apartName,
  data,
}: ApartDetailInfoProps) {
  const addFavoriteApart = useAddFavoriteApartHandler();
  const removeFavoriteApart = useRemoveFavoriteApartHandler();
  const favoriteApartList = useFavoriteApartList();
  const currentApartItem = {
    apartName,
    regionCode,
    address: removeSpecialCharacters(data.address),
  };

  const isFavorite = favoriteApartList.some(
    favoriteApartItem =>
      createApartItemKey(currentApartItem) ===
      createApartItemKey(favoriteApartItem)
  );

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFavoriteApart(currentApartItem);
    } else {
      addFavoriteApart(currentApartItem);
    }
  };

  return (
    <ApartInfoTable
      isFavorite={isFavorite}
      apartName={apartName}
      data={data}
      onToggleFavorite={toggleFavorite}
    />
  );
}
