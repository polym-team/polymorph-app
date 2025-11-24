'use client';

import {
  useAddFavoriteApartHandler,
  useFavoriteApartListQuery,
  useRemoveFavoriteApartHandler,
} from '@/entities/apart';
import { FavoriteApartItem } from '@/entities/apart/models/types';
import { ROUTE_PATH } from '@/shared/consts/route';
import { useNavigate } from '@/shared/hooks/useNavigate';

import { useEffect, useMemo, useRef, useState } from 'react';

import {
  calculateFavoriteApartIds,
  calculateRegionItems,
} from '../services/calculator';
import { EmptyApartList } from '../ui/EmptyApartList';
import { FavoriteApartList } from '../ui/FavoriteApartList';
import { FavoriteApartListSkeleton } from '../ui/FavoriteApartListSkeleton';

export function ApartList() {
  const { navigate } = useNavigate();
  const { data: favoriteApartList = [], isLoading: favoriteApartLoading } =
    useFavoriteApartListQuery();
  const addFavoriteApart = useAddFavoriteApartHandler();
  const removeFavoriteApart = useRemoveFavoriteApartHandler();
  const isChangingFavoriteApartList = useRef(false);

  const [localFavoriteApartList, setLocalFavoriteApartList] = useState<
    FavoriteApartItem[]
  >([]);

  useEffect(() => {
    if (isChangingFavoriteApartList.current) {
      isChangingFavoriteApartList.current = true;
      return;
    }

    setLocalFavoriteApartList(favoriteApartList);
  }, [favoriteApartList]);

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
    isChangingFavoriteApartList.current = true;
    addFavoriteApart({ ...apartItem, regionCode });
  };

  const handleRemoveApartItem = (
    regionCode: string,
    apartItem: FavoriteApartItem
  ) => {
    isChangingFavoriteApartList.current = true;
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
