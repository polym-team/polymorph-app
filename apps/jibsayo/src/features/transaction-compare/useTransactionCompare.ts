import { SearchedApartmentItem, useApartSearchQuery } from '@/entities/apart';

import { useRef, useState } from 'react';

import { toast } from '@package/ui';

interface Return {
  isFetching: boolean;
  showsItems: boolean;
  items: SearchedApartmentItem[];
  selectedApartIds: number[];
  apartName: string;
  focusSearchInput: () => void;
  blurSearchInput: () => void;
  changeApartName: (value: string) => void;
  clickApartItem: (item: SearchedApartmentItem) => void;
}

export const useTransactionCompare = (): Return => {
  const [showsItems, setShowsItems] = useState<boolean>(false);
  const [selectedApartIds, setSelectedApartIds] = useState<number[]>([]);
  const [apartName, setApartName] = useState<string>('');

  const itemTimerRef = useRef(0);
  const inputTimerRef = useRef(0);

  const { isFetching, data } = useApartSearchQuery({ apartName });

  const items = data ?? [];

  const focusSearchInput = () => {
    setShowsItems(true);
  };

  const blurSearchInput = () => {
    itemTimerRef.current = window.setTimeout(() => {
      setShowsItems(false);
    }, 100);
  };

  const changeApartName = (value: string) => {
    const trimmedValue = value.trim();
    if (trimmedValue === '') {
      setApartName('');
      return;
    }

    if (inputTimerRef.current) {
      window.clearTimeout(inputTimerRef.current);
    }

    inputTimerRef.current = window.setTimeout(() => {
      setApartName(trimmedValue);
    }, 300);
  };

  const clickApartItem = (item: SearchedApartmentItem) => {
    if (selectedApartIds.includes(item.id)) {
      setSelectedApartIds(prev => prev.filter(id => id !== item.id));
      return;
    }

    if (selectedApartIds.length >= 10) {
      toast.error('최대 10개까지 선택할 수 있어요');
      return;
    }

    setSelectedApartIds(prev => [...prev, item.id]);
  };

  return {
    isFetching,
    showsItems,
    items,
    selectedApartIds,
    apartName,
    focusSearchInput,
    blurSearchInput,
    changeApartName,
    clickApartItem,
  };
};
