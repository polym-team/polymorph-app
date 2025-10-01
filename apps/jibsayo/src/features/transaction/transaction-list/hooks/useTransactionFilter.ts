import { RULES, SearchParams, useSearchParams } from '@/entities/transaction';

import { useEffect, useState } from 'react';

import { TransactionFilter } from '../models/types';

interface Return {
  filter: TransactionFilter;
  selectedFilter: TransactionFilter;
  changeFilter: (value: Partial<TransactionFilter>) => void;
  submitFilter: () => void;
  resetFilter: () => void;
}

const initialState: TransactionFilter = {
  apartName: '',
  minSize: RULES.SEARCH_MIN_SIZE,
  maxSize: RULES.SEARCH_MAX_SIZE,
  favoriteOnly: false,
  newTransactionOnly: false,
};

export const useTransactionFilter = (): Return => {
  const { searchParams, setSearchParams } = useSearchParams();

  const [filter, setFilter] = useState<TransactionFilter>(initialState);

  const selectedFilter: TransactionFilter = {
    apartName: searchParams.apartName,
    minSize: searchParams.minSize,
    maxSize: searchParams.maxSize,
    favoriteOnly: searchParams.favoriteOnly,
    newTransactionOnly: searchParams.newTransactionOnly,
  };

  const changeFilter = (nextFilter: Partial<TransactionFilter>) => {
    const changedFilter = { ...filter, ...nextFilter };
    setFilter(changedFilter);
  };

  const submitFilter = () => {
    setSearchParams(filter);
  };

  const resetFilter = () => {
    setFilter(initialState);
  };

  useEffect(() => {}, [searchParams]);

  return { filter, selectedFilter, changeFilter, submitFilter, resetFilter };
};
