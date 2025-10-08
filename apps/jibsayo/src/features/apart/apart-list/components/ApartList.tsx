'use client';

import {
  useFavoriteApartList,
  useRemoveFavoriteApartHandler,
} from '@/entities/apart';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { ApartItem } from '../models/types';
import { calculateRegionItems } from '../services/calculator';
import { FavoriteApartList } from '../ui/FavoriteApartList';

export function ApartList() {
  const router = useRouter();
  const favoriteApartList = useFavoriteApartList();
  const removeFavoriteApart = useRemoveFavoriteApartHandler();

  const regionItems = useMemo(() => {
    return calculateRegionItems(favoriteApartList);
  }, [favoriteApartList]);

  const handleClickApartItem = (regionCode: string, apartItem: ApartItem) => {
    router.push(`/apart/${regionCode}/${apartItem.name}`);
  };

  const handleRemoveApartItem = (regionCode: string, apartItem: ApartItem) => {
    removeFavoriteApart({
      regionCode,
      apartName: apartItem.name,
      address: apartItem.address,
    });
  };

  return (
    <FavoriteApartList
      regionItems={regionItems}
      onClickApartItem={handleClickApartItem}
      onRemoveApartItem={handleRemoveApartItem}
    />
  );
}
