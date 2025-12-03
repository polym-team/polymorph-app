import {
  useAddFavoriteApartMutation,
  useFavoriteApartListQuery,
  useRemoveFavoriteApartMutation,
} from '@/entities/apart';
import { FavoriteApartItem } from '@/entities/apart';
import { ROUTE_PATH } from '@/shared/consts/route';
import { useNavigate } from '@/shared/hooks/useNavigate';

import { useEffect, useMemo, useRef, useState } from 'react';

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
  const { data = [], isLoading } = useFavoriteApartListQuery();
  const { mutate: mutateFavoriteApartAdd } = useAddFavoriteApartMutation();
  const { mutate: mutateFavoriteApartRemove } =
    useRemoveFavoriteApartMutation();

  const isChangingFavoriteApartList = useRef(false);

  const [localFavoriteApartList, setLocalFavoriteApartList] = useState<
    FavoriteApartItem[]
  >([]);

  useEffect(() => {
    if (isChangingFavoriteApartList.current) {
      isChangingFavoriteApartList.current = true;
      return;
    }

    setLocalFavoriteApartList(data);
  }, [data]);

  const favoriteApartIdsSet = useMemo(() => {
    return new Set(data.map(item => item.apartToken));
  }, [data]);

  const regionItems = useMemo(() => {
    return convertToRegionItems(localFavoriteApartList, favoriteApartIdsSet);
  }, [localFavoriteApartList, favoriteApartIdsSet]);

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
    navigate(`${ROUTE_PATH.APART}/${apartItem.apartToken}`);
  };

  return {
    isLoading,
    regionItems,
    toggleFavoriteApart,
    clickApartItem,
  };
};
