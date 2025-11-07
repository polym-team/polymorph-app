'use client';

import {
  useFavoriteApartList,
  useRemoveFavoriteApartHandler,
} from '@/entities/apart';
import { FavoriteApartItem } from '@/entities/apart/models/types';
import { ROUTE_PATH } from '@/shared/consts/route';
import { useNavigate } from '@/shared/hooks/useNavigate';

import { useMemo } from 'react';

import { calculateRegionItems } from '../services/calculator';
import { EmptyApartList } from '../ui/EmptyApartList';
import { FavoriteApartList } from '../ui/FavoriteApartList';

export function ApartList() {
  const { navigate } = useNavigate();
  const favoriteApartList = useFavoriteApartList();
  const removeFavoriteApart = useRemoveFavoriteApartHandler();

  const regionItems = useMemo(() => {
    return calculateRegionItems(favoriteApartList);
  }, [favoriteApartList]);

  const handleClickApartItem = (
    regionCode: string,
    apartItem: FavoriteApartItem
  ) => {
    navigate(
      `${ROUTE_PATH.APART_DETAIL}?regionCode=${regionCode}&apartName=${apartItem.apartName}`
    );
  };

  const handleRemoveApartItem = (
    regionCode: string,
    apartItem: FavoriteApartItem
  ) => {
    removeFavoriteApart({
      apartId: apartItem.apartId,
      regionCode,
      apartName: apartItem.apartName,
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
