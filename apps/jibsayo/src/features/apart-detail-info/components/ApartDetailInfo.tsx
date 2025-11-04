'use client';

import { ApartDetailResponse } from '@/app/api/apart/models/types';
import { useFavoriteApartList } from '@/entities/apart';
import { createApartItemKey } from '@/shared/services/transactionService';

import { ApartInfoTable } from '../ui/ApartInfoTable';

interface ApartDetailInfoProps {
  data: ApartDetailResponse;
}

export function ApartDetailInfo({ data }: ApartDetailInfoProps) {
  const favoriteApartList = useFavoriteApartList();
  const isFavorite = favoriteApartList.some(
    favoriteApartItem =>
      createApartItemKey(data) === createApartItemKey(favoriteApartItem)
  );

  return <ApartInfoTable isFavorite={isFavorite} data={data} />;
}
