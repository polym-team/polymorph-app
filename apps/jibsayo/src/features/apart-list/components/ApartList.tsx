'use client';

import {
  useAddFavoriteApartHandler,
  useFavoriteApartList,
  useFavoriteApartLoading,
  useRemoveFavoriteApartHandler,
} from '@/entities/apart';
import { FavoriteApartItem } from '@/entities/apart/models/types';
import { ROUTE_PATH } from '@/shared/consts/route';
import { useOnceEffect } from '@/shared/hooks';
import { useNavigate } from '@/shared/hooks/useNavigate';

import { useMemo, useState } from 'react';

import {
  calculateFavoriteApartIds,
  calculateRegionItems,
} from '../services/calculator';
import { EmptyApartList } from '../ui/EmptyApartList';
import { FavoriteApartList } from '../ui/FavoriteApartList';
import { FavoriteApartListSkeleton } from '../ui/FavoriteApartListSkeleton';

export function ApartList() {
  const { navigate } = useNavigate();
  const favoriteApartList = useFavoriteApartList();
  const favoriteApartLoading = useFavoriteApartLoading();
  const addFavoriteApart = useAddFavoriteApartHandler();
  const removeFavoriteApart = useRemoveFavoriteApartHandler();

  const [localFavoriteApartList, setLocalFavoriteApartList] = useState<
    FavoriteApartItem[]
  >([]);

  useOnceEffect(favoriteApartList.length > 0, () => {
    setLocalFavoriteApartList(favoriteApartList);
  });

  const favoriteApartIds = useMemo(() => {
    return calculateFavoriteApartIds(favoriteApartList);
  }, [favoriteApartList]);

  const regionItems = useMemo(() => {
    return calculateRegionItems(localFavoriteApartList);
  }, [localFavoriteApartList]);

  const handleClickApartItem = (
    regionCode: string,
    apartItem: FavoriteApartItem
  ) => {
    navigate(
      `${ROUTE_PATH.APART_DETAIL}?regionCode=${regionCode}&apartName=${apartItem.apartName}`
    );
  };

  const handleAddApartItem = (
    regionCode: string,
    apartItem: FavoriteApartItem
  ) => {
    addFavoriteApart({ ...apartItem, regionCode });
  };

  const handleRemoveApartItem = (
    regionCode: string,
    apartItem: FavoriteApartItem
  ) => {
    removeFavoriteApart({ ...apartItem, regionCode });
  };

  if (favoriteApartLoading) {
    return <FavoriteApartListSkeleton />;
  }

  if (regionItems.length === 0) {
    return <EmptyApartList />;
  }

  return (
    <FavoriteApartList
      regionItems={regionItems}
      favoriteApartIds={favoriteApartIds}
      onClickApartItem={handleClickApartItem}
      onAddApartItem={handleAddApartItem}
      onRemoveApartItem={handleRemoveApartItem}
    />
  );
}
