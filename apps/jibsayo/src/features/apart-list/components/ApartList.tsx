'use client';

import {
  useFavoriteApartList,
  useRemoveFavoriteApartHandler,
} from '@/entities/apart';
import { ROUTE_PATH } from '@/shared/consts/route';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { ApartItem } from '../models/types';
import { calculateRegionItems } from '../services/calculator';
import { EmptyApartList } from '../ui/EmptyApartList';
import { FavoriteApartList } from '../ui/FavoriteApartList';

export function ApartList() {
  const router = useRouter();
  const favoriteApartList = useFavoriteApartList();
  const removeFavoriteApart = useRemoveFavoriteApartHandler();

  const regionItems = useMemo(() => {
    return calculateRegionItems(favoriteApartList);
  }, [favoriteApartList]);

  const handleClickApartItem = (regionCode: string, apartItem: ApartItem) => {
    router.push(
      `${ROUTE_PATH.APART_DETAIL}?regionCode=${regionCode}&apartName=${apartItem.name}`
    );
  };

  const handleRemoveApartItem = (regionCode: string, apartItem: ApartItem) => {
    removeFavoriteApart({
      apartId: `${regionCode}-${apartItem.name}-${apartItem.address}`,
      regionCode,
      apartName: apartItem.name,
      address: apartItem.address,
    });
  };

  if (regionItems.length === 0) {
    return <EmptyApartList />;
  }

  return (
    <FavoriteApartList
      regionItems={regionItems}
      onClickApartItem={handleClickApartItem}
      onRemoveApartItem={handleRemoveApartItem}
    />
  );
}
