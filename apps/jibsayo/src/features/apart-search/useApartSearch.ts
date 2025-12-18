import { SearchedApartmentItem, useApartSearchQuery } from '@/entities/apart';

import { useRef, useState } from 'react';

interface Return {
  isFetching: boolean;
  isEmpty: boolean;
  items: SearchedApartmentItem[];
  apartName: string;
  changeApartName: (value: string) => void;
}

export const useApartSearch = (): Return => {
  const [apartName, setApartName] = useState('');
  const timerRef = useRef(0);

  const { isFetching, data } = useApartSearchQuery({ apartName });
  const items = data ?? [];
  const isEmpty = !!data && data.length === 0;

  const changeApartName = (value: string) => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      setApartName(value);
    }, 300);
  };

  return { isFetching, isEmpty, items, apartName, changeApartName };
};
