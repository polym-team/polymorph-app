import { SearchedApartmentItem, useApartSearchQuery } from '@/entities/apart';

import { useRef, useState } from 'react';

import { toast } from '@package/ui';

import { MAX_COMPARE_APART_COUNT } from './consts';

interface Return {
  isFetching: boolean;
  showsItems: boolean;
  items: SearchedApartmentItem[];
  selectedApartIds: number[];
  apartNameValue: string;
  focusSearchInput: () => void;
  blurSearchInput: () => void;
  changeApartName: (value: string) => void;
  clickApartItem: (item: SearchedApartmentItem) => void;
}

export const useTransactionCompare = (): Return => {
  const [activedInput, setActivedInput] = useState<boolean>(false);
  const [selectedApartIds, setSelectedApartIds] = useState<number[]>([]);
  const [apartNameValue, setApartNameValue] = useState<string>('');
  const [apartNameParam, setApartNameParam] = useState<string>('');

  const itemTimerRef = useRef(0);
  const inputTimerRef = useRef(0);

  const { isFetching, data } = useApartSearchQuery({
    apartName: apartNameParam,
  });

  const items = data ?? [];
  const showsItems = activedInput && (isFetching || items.length > 0);

  const focusSearchInput = () => {
    setActivedInput(true);
  };

  const blurSearchInput = () => {
    itemTimerRef.current = window.setTimeout(() => {
      setActivedInput(false);
    }, 100);
  };

  const changeApartName = (value: string) => {
    const trimmedValue = value.trim();
    if (trimmedValue === '') {
      setApartNameValue('');
      setApartNameParam('');
      return;
    }

    setApartNameValue(trimmedValue);

    if (inputTimerRef.current) {
      window.clearTimeout(inputTimerRef.current);
    }

    inputTimerRef.current = window.setTimeout(() => {
      setApartNameParam(trimmedValue);
    }, 300);
  };

  const clickApartItem = (item: SearchedApartmentItem) => {
    if (selectedApartIds.includes(item.id)) {
      setSelectedApartIds(prev => prev.filter(id => id !== item.id));
      return;
    }

    if (selectedApartIds.length >= MAX_COMPARE_APART_COUNT) {
      toast.error(`최대 ${MAX_COMPARE_APART_COUNT}개까지 선택할 수 있어요`);
      return;
    }

    setSelectedApartIds(prev => [...prev, item.id]);
  };

  return {
    isFetching,
    showsItems,
    items,
    selectedApartIds,
    apartNameValue,
    focusSearchInput,
    blurSearchInput,
    changeApartName,
    clickApartItem,
  };
};
