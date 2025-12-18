import {
  useAddFavoriteApartMutation,
  useFavoriteApartListQuery,
  useFavoritesTransactions,
  useRemoveFavoriteApartMutation,
} from '@/entities/apart';
import { FavoriteApartItem } from '@/entities/apart';
import { ROUTE_PATH } from '@/shared/consts/route';
import { useNavigate } from '@/shared/hooks/useNavigate';

import { useEffect, useMemo, useRef, useState } from 'react';

import { toast } from '@package/ui';

import { convertToRegionItems } from './services';
import { FavoriteApartItemViewModel, RegionItemViewModel } from './types';

interface Return {
  isLoading: boolean;
  regionItems: RegionItemViewModel[];
  toggleFavoriteApart: (apartItem: FavoriteApartItemViewModel) => void;
  clickApartItem: (apartItem: FavoriteApartItemViewModel) => void;
}

export const useFavoriteApartList = (): Return => {
  const { navigate } = useNavigate();
  const { data: favoriteApartsData = [], isLoading: isFavoriteApartsLoading } =
    useFavoriteApartListQuery();
  const { mutate: mutateFavoriteApartAdd } = useAddFavoriteApartMutation();
  const { mutate: mutateFavoriteApartRemove } =
    useRemoveFavoriteApartMutation();

  const isChangingFavoriteApartList = useRef(false);

  const [localFavoriteApartList, setLocalFavoriteApartList] = useState<
    FavoriteApartItem[]
  >([]);

  const apartIds = useMemo(() => {
    return localFavoriteApartList.map(item => item.apartId);
  }, [localFavoriteApartList]);

  const { data: transactionsData, isLoading: isFavoritesTransactionsLoading } =
    useFavoritesTransactions(apartIds);

  useEffect(() => {
    if (isChangingFavoriteApartList.current) {
      isChangingFavoriteApartList.current = true;
      return;
    }

    setLocalFavoriteApartList(favoriteApartsData);
  }, [favoriteApartsData]);

  const isLoading = isFavoriteApartsLoading || isFavoritesTransactionsLoading;
  const favoriteApartIdsSet = useMemo(() => {
    return new Set(favoriteApartsData.map(item => item.apartId));
  }, [favoriteApartsData]);

  const transactionsMap = useMemo(() => {
    const map = new Map();
    transactionsData?.results.forEach(summary => {
      map.set(summary.apartId, summary);
    });
    return map;
  }, [transactionsData]);

  const regionItems = useMemo(() => {
    return convertToRegionItems(
      localFavoriteApartList,
      favoriteApartIdsSet,
      transactionsMap
    );
  }, [localFavoriteApartList, favoriteApartIdsSet, transactionsMap]);

  const addFavoriteApart = (apartItem: FavoriteApartItemViewModel) => {
    isChangingFavoriteApartList.current = true;
    mutateFavoriteApartAdd(apartItem);
  };

  const removeFavoriteApart = (apartItem: FavoriteApartItemViewModel) => {
    isChangingFavoriteApartList.current = true;
    mutateFavoriteApartRemove(apartItem);
  };

  const toggleFavoriteApart = (apartItem: FavoriteApartItemViewModel) => {
    if (apartItem.isFavorite) {
      removeFavoriteApart(apartItem);
    } else {
      addFavoriteApart(apartItem);
    }
  };

  const clickApartItem = (apartItem: FavoriteApartItemViewModel) => {
    if (!apartItem.apartId) {
      toast.error('아파트 정보를 불러오지 못했어요');
      return;
    }

    navigate(`${ROUTE_PATH.APART}/${apartItem.apartId}`);
  };
  console.log('transactionsMap: ', transactionsMap);
  console.log('regionItems: ', regionItems);
  return {
    isLoading,
    regionItems,
    toggleFavoriteApart,
    clickApartItem,
  };
};
