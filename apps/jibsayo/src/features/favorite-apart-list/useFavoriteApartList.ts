import {
  useAddFavoriteApartMutation,
  useFavoriteApartListQuery,
  useFavoritesTransactions,
  useRemoveFavoriteApartMutation,
} from '@/entities/apart';
import { FavoriteApartItem } from '@/entities/apart';
import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import { ROUTE_PATH } from '@/shared/consts/route';
import { useNavigate } from '@/shared/hooks/useNavigate';

import { useEffect, useMemo, useRef, useState } from 'react';

import { toast } from '@package/ui';

import { convertToRegionItems } from './services';
import {
  FavoriteApartItemViewModel,
  RegionItemViewModel,
  RegionTab,
} from './types';

interface Return {
  isApartLoading: boolean;
  regionTabs: RegionTab[];
  selectedRegionCode: string;
  regionItems: RegionItemViewModel[];
  setSelectedRegionCode: (code: string) => void;
  toggleFavoriteApart: (apartItem: FavoriteApartItemViewModel) => void;
  clickApartItem: (apartItem: FavoriteApartItemViewModel) => void;
}

export const useFavoriteApartList = (): Return => {
  const { navigate } = useNavigate();
  const { data: favoriteApartsData = [] } = useFavoriteApartListQuery();
  const { mutate: mutateFavoriteApartAdd } = useAddFavoriteApartMutation();
  const { mutate: mutateFavoriteApartRemove } =
    useRemoveFavoriteApartMutation();

  const isChangingFavoriteApartList = useRef(false);

  const [localFavoriteApartList, setLocalFavoriteApartList] = useState<
    FavoriteApartItem[]
  >([]);
  const [selectedRegionCode, setSelectedRegionCode] = useState<string>('');

  const regionTabs = useMemo(() => {
    const codes = Array.from(
      new Set(localFavoriteApartList.map(item => item.regionCode))
    );
    return codes
      .map(code => ({
        code,
        name: `${getCityNameWithRegionCode(code)} ${getRegionNameWithRegionCode(code)}`,
        count: localFavoriteApartList.filter(item => item.regionCode === code)
          .length,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  }, [localFavoriteApartList]);

  useEffect(() => {
    if (isChangingFavoriteApartList.current) {
      isChangingFavoriteApartList.current = true;
      return;
    }

    setLocalFavoriteApartList(favoriteApartsData);
  }, [favoriteApartsData]);

  useEffect(() => {
    if (!selectedRegionCode && regionTabs.length > 0) {
      setSelectedRegionCode(regionTabs[0].code);
    }
  }, [regionTabs, selectedRegionCode]);

  const selectedRegionAparts = useMemo(() => {
    return localFavoriteApartList.filter(
      item => item.regionCode === selectedRegionCode
    );
  }, [localFavoriteApartList, selectedRegionCode]);

  const apartIds = useMemo(() => {
    return selectedRegionAparts.map(item => item.apartId);
  }, [selectedRegionAparts]);

  const { data: transactionsData, isLoading: isFavoritesTransactionsLoading } =
    useFavoritesTransactions(apartIds);

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
      selectedRegionAparts,
      favoriteApartIdsSet,
      transactionsMap
    );
  }, [selectedRegionAparts, favoriteApartIdsSet, transactionsMap]);

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

  return {
    isApartLoading: isFavoritesTransactionsLoading,
    regionTabs,
    selectedRegionCode,
    regionItems,
    setSelectedRegionCode,
    toggleFavoriteApart,
    clickApartItem,
  };
};
