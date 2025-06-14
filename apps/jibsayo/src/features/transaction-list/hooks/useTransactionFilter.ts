import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { getItem, setItem } from '@/shared/lib/sessionStorage';

import { useEffect, useState } from 'react';

import { TransactionFilter } from '../models/types';
import { useSearchParamChange } from './useSearchParamChange';

interface Return {
  filter: TransactionFilter;
  setFilter: (value: Partial<TransactionFilter>) => void;
}

const initialState: TransactionFilter = {
  apartName: '',
  isNationalSizeOnly: false,
  isFavoriteOnly: false,
};

export const useTransactionFilter = (): Return => {
  const [filterState, setFilterState] =
    useState<TransactionFilter>(initialState);

  useEffect(() => {
    const storedFilter = getItem<TransactionFilter>(
      STORAGE_KEY.TRANSACTION_LIST_FILTER
    );
    if (storedFilter) {
      setFilterState(storedFilter);
    }
  }, []);

  useSearchParamChange(() => {
    setFilterState(initialState);
  });

  const setFilter = (nextFilter: Partial<TransactionFilter>) => {
    const changedFilter = { ...filterState, ...nextFilter };
    setFilterState(changedFilter);
    setItem(STORAGE_KEY.TRANSACTION_LIST_FILTER, changedFilter);
  };

  return {
    filter: filterState,
    setFilter: setFilter,
  };
};
