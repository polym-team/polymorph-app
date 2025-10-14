import { useSearchParams } from '@/entities/transaction';

import { useState } from 'react';

import { FilterForm } from '../models/types';

interface Return {
  filter: FilterForm;
  appliedFilter: FilterForm;
  changeFilter: (value: Partial<FilterForm>) => void;
  removeFilter: (value: Partial<FilterForm>) => void;
}

export const useFilterForm = (): Return => {
  const { searchParams, setSearchParams } = useSearchParams();

  const [filter, setFilter] = useState<FilterForm>(() => {
    return {
      apartName: searchParams.apartName,
      minSize: searchParams.minSize,
      maxSize: searchParams.maxSize,
      favoriteOnly: searchParams.favoriteOnly,
      newTransactionOnly: searchParams.newTransactionOnly,
    };
  });

  const appliedFilter: FilterForm = {
    apartName: searchParams.apartName,
    minSize: searchParams.minSize,
    maxSize: searchParams.maxSize,
    favoriteOnly: searchParams.favoriteOnly,
    newTransactionOnly: searchParams.newTransactionOnly,
  };

  const changeFilter = (nextFilter: Partial<FilterForm>) => {
    const changedFilter = { ...filter, ...nextFilter };
    setFilter(changedFilter);
  };

  const removeFilter = (nextFilter: Partial<FilterForm>) => {
    setFilter({ ...filter, ...nextFilter });
    setSearchParams({ ...searchParams, ...nextFilter });
  };

  return { filter, appliedFilter, changeFilter, removeFilter };
};
