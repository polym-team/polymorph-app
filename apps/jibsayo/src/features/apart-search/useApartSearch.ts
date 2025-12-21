import {
  useAddFavoriteApartMutation,
  useApartSearchQuery,
  useFavoriteApartListQuery,
  useRemoveFavoriteApartMutation,
} from '@/entities/apart';
import { ROUTE_PATH } from '@/shared/consts/route';
import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { useNavigate } from '@/shared/hooks/useNavigate';
import { getItem, setItem } from '@/shared/lib/localStorage';

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
  recentSearchedApartNames: string[];
  changeApartName: (value: string) => void;
  toggleFavorite: (item: ApartSearchItemViewModel) => void;
  clickApartItem: (item: ApartSearchItemViewModel) => void;
  removeRecentSearchedApartName: (apartName: string) => void;
}

export const useApartSearch = (): Return => {
  const router = useRouter();
  const location = new URL(window.location.href);

  const [apartName, setApartName] = useState(
    location.searchParams.get('apartName') ?? ''
  );
  const [recentSearchedApartNames, setRecentSearchedApartNames] = useState(
    getItem<string[]>(STORAGE_KEY.RECENT_SEARCHED_APART_LIST) ?? []
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

  const isEmpty = !data;

  const changeApartName = (value: string) => {
    const trimmedValue = value.trim();
    if (trimmedValue === '') {
      setApartName('');
      return;
    }

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      router.push(`${ROUTE_PATH.SEARCH}?apartName=${trimmedValue}`);
      setApartName(trimmedValue);

      if (!recentSearchedApartNames.includes(trimmedValue)) {
        setTimeout(() => {
          setRecentSearchedApartNames(prev => {
            const nextValue = [trimmedValue, ...prev].slice(0, 10);
            setItem(STORAGE_KEY.RECENT_SEARCHED_APART_LIST, nextValue);
            return nextValue;
          });
        }, 300);
      }
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

  const removeRecentSearchedApartName = (apartName: string) => {
    setRecentSearchedApartNames(prev => {
      const nextValue = prev.filter(name => name !== apartName);
      setItem(STORAGE_KEY.RECENT_SEARCHED_APART_LIST, nextValue);
      return nextValue;
    });
  };

  return {
    isFetching,
    isEmpty,
    items,
    apartName,
    recentSearchedApartNames,
    changeApartName,
    toggleFavorite,
    clickApartItem,
    removeRecentSearchedApartName,
  };
};
