import {
  SearchedApartmentItem,
  useApartSearchQuery,
  useFavoriteApartListQuery,
} from '@/entities/apart';

import { useRef, useState } from 'react';

import { toast } from '@package/ui';

import { MAX_COMPARE_APART_COUNT } from './consts';

interface Return {
  isFetching: boolean;
  showsItems: boolean;
  items: SearchedApartmentItem[];
  selectedApartIds: number[];
  selectedAparts: SearchedApartmentItem[];
  selectedSizesByApart: Map<number, [number, number][]>;
  availableSizesByApart: Map<number, [number, number][]>;
  apartNameValue: string;
  apartNameParam: string;
  favoriteAparts: { apartId: number; apartName: string }[];
  focusSearchInput: () => void;
  blurSearchInput: () => void;
  changeApartName: (value: string) => void;
  clickApartItem: (item: SearchedApartmentItem) => void;
  clickFavoriteApart: (apartId: number, apartName: string) => void;
  toggleApartSize: (apartId: number, sizeRange: [number, number]) => void;
  setAvailableSizesByApart: React.Dispatch<
    React.SetStateAction<Map<number, [number, number][]>>
  >;
  setSelectedSizesByApart: React.Dispatch<
    React.SetStateAction<Map<number, [number, number][]>>
  >;
}

export const useTransactionCompare = (): Return => {
  const [activedInput, setActivedInput] = useState<boolean>(false);
  const [selectedApartIds, setSelectedApartIds] = useState<number[]>([]);
  const [selectedAparts, setSelectedAparts] = useState<SearchedApartmentItem[]>(
    []
  );
  const [selectedSizesByApart, setSelectedSizesByApart] = useState<
    Map<number, [number, number][]>
  >(new Map());
  const [availableSizesByApart, setAvailableSizesByApart] = useState<
    Map<number, [number, number][]>
  >(new Map());
  const [apartNameValue, setApartNameValue] = useState<string>('');
  const [apartNameParam, setApartNameParam] = useState<string>('');

  const itemTimerRef = useRef(0);
  const inputTimerRef = useRef(0);

  const { isFetching, data } = useApartSearchQuery({
    apartName: apartNameParam,
  });
  const { data: favoriteApartsData = [] } = useFavoriteApartListQuery();

  const items = data ?? [];
  const showsItems = !!apartNameValue && activedInput;
  const favoriteAparts = favoriteApartsData.map(item => ({
    apartId: item.apartId,
    apartName: item.apartName,
  }));

  const focusSearchInput = () => {
    setActivedInput(true);
  };

  const blurSearchInput = () => {
    itemTimerRef.current = window.setTimeout(() => {
      setActivedInput(false);
    }, 100);
  };

  const changeApartName = (value: string) => {
    if (!value) {
      setApartNameValue('');
      setApartNameParam('');
      return;
    }

    if (inputTimerRef.current) {
      window.clearTimeout(inputTimerRef.current);
    }

    setApartNameValue(value);

    inputTimerRef.current = window.setTimeout(() => {
      setApartNameParam(value.trim());
    }, 300);
  };

  const clickApartItem = (item: SearchedApartmentItem) => {
    if (selectedApartIds.includes(item.id)) {
      setSelectedApartIds(prev => prev.filter(id => id !== item.id));
      setSelectedAparts(prev => prev.filter(apart => apart.id !== item.id));

      setSelectedSizesByApart(prev => {
        const newMap = new Map(prev);
        newMap.delete(item.id);
        return newMap;
      });

      setAvailableSizesByApart(prev => {
        const newMap = new Map(prev);
        newMap.delete(item.id);
        return newMap;
      });

      return;
    }

    if (selectedApartIds.length >= MAX_COMPARE_APART_COUNT) {
      toast.error(`최대 ${MAX_COMPARE_APART_COUNT}개까지 선택할 수 있어요`);
      return;
    }

    setSelectedApartIds(prev => [...prev, item.id]);
    setSelectedAparts(prev => [...prev, item]);
  };

  const clickFavoriteApart = (apartId: number) => {
    const favoriteApartData = favoriteApartsData.find(
      item => item.apartId === apartId
    );

    if (!favoriteApartData) return;

    const searchedItem: SearchedApartmentItem = {
      id: favoriteApartData.apartId,
      apartName: favoriteApartData.apartName,
      regionCode: favoriteApartData.regionCode,
      householdCount: null,
      completionYear: 0,
      dong: '',
    };

    clickApartItem(searchedItem);
  };

  const toggleApartSize = (apartId: number, sizeRange: [number, number]) => {
    setSelectedSizesByApart(prev => {
      const newMap = new Map(prev);
      const currentSizes = newMap.get(apartId) || [];

      const isSelected = currentSizes.some(
        ([min, max]) => min === sizeRange[0] && max === sizeRange[1]
      );

      if (isSelected) {
        const filtered = currentSizes.filter(
          ([min, max]) => !(min === sizeRange[0] && max === sizeRange[1])
        );

        if (filtered.length === 0) {
          toast.error('한 개 이상의 평형을 선택해 주세요');
          return prev;
        }

        newMap.set(apartId, filtered);
      } else {
        newMap.set(apartId, [...currentSizes, sizeRange]);
      }

      return newMap;
    });
  };

  return {
    isFetching,
    showsItems,
    items,
    selectedApartIds,
    selectedAparts,
    selectedSizesByApart,
    availableSizesByApart,
    apartNameValue,
    apartNameParam,
    favoriteAparts,
    focusSearchInput,
    blurSearchInput,
    changeApartName,
    clickApartItem,
    clickFavoriteApart,
    toggleApartSize,
    setAvailableSizesByApart,
    setSelectedSizesByApart,
  };
};
