import {
  useAddFavoriteApartMutation,
  useApartSearchQuery,
  useFavoriteApartListQuery,
  useRemoveFavoriteApartMutation,
} from '@/entities/apart';
import { ROUTE_PATH } from '@/shared/consts/route';
import { useNavigate } from '@/shared/hooks/useNavigate';

import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';

import {
  convertToApartSearchViewModel,
  convertToFavoriteApartIdSet,
} from './services';
import { ApartSearchItemViewModel } from './types';

interface Return {
  isFetching: boolean;
  isEmpty: boolean;
  items: ApartSearchItemViewModel[];
  apartName: string;
  changeApartName: (value: string) => void;
  toggleFavorite: (item: ApartSearchItemViewModel) => void;
  clickApartItem: (item: ApartSearchItemViewModel) => void;
}

export const useApartSearch = (): Return => {
  const router = useRouter();
  const location = new URL(window.location.href);

  const [apartName, setApartName] = useState(
    location.searchParams.get('apartName') ?? ''
  );
  const timerRef = useRef(0);

  const { isFetching, data } = useApartSearchQuery({ apartName });
  const { data: favoriteApartListData } = useFavoriteApartListQuery();
  const { mutate: addFavoriteApart } = useAddFavoriteApartMutation();
  const { mutate: removeFavoriteApart } = useRemoveFavoriteApartMutation();
  const { navigate } = useNavigate();

  const favoriteApartIdSet = useMemo(
    () => convertToFavoriteApartIdSet(favoriteApartListData ?? []),
    [favoriteApartListData]
  );

  const items = useMemo(() => {
    if (!data) return [];
    return convertToApartSearchViewModel(data, favoriteApartIdSet);
  }, [data, favoriteApartIdSet]);

  const isEmpty = !!data && data.length === 0;

  const changeApartName = (value: string) => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      router.push(`${ROUTE_PATH.SEARCH}?apartName=${value}`);
      setApartName(value);
    }, 300);
  };

  const toggleFavorite = (item: ApartSearchItemViewModel) => {
    if (item.isFavorite) {
      removeFavoriteApart({
        apartId: item.id,
        regionCode: item.regionCode,
        apartName: item.apartName,
      });
    } else {
      addFavoriteApart({
        apartId: item.id,
        regionCode: item.regionCode,
        apartName: item.apartName,
      });
    }
  };

  const clickApartItem = (item: ApartSearchItemViewModel) => {
    navigate(`${ROUTE_PATH.APART}/${item.id}`);
  };

  return {
    isFetching,
    isEmpty,
    items,
    apartName,
    changeApartName,
    toggleFavorite,
    clickApartItem,
  };
};
