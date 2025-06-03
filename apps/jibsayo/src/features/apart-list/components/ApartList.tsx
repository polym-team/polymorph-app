'use client';

import { useFavoriteApartList } from '@/entities/apart';

export function ApartList() {
  const { favoriteApartList } = useFavoriteApartList();

  return <div>{favoriteApartList.map(apart => apart.regionCode)}</div>;
}
