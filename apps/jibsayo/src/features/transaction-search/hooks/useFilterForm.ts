import { useSearchParams } from '@/entities/transaction';

import { useState } from 'react';

import { FilterForm } from '../models/types';

interface Return {
  filter: FilterForm;
  changeFilter: (value: Partial<FilterForm>) => void;
}

export const useFilterForm = (): Return => {
  const { searchParams } = useSearchParams();

  const [filter, setFilter] = useState<FilterForm>(() => {
    return {
      apartName: searchParams.apartName,
      minSize: searchParams.minSize,
      maxSize: searchParams.maxSize,
      favoriteOnly: searchParams.favoriteOnly,
      newTransactionOnly: searchParams.newTransactionOnly,
    };
  });

  const changeFilter = (nextFilter: Partial<FilterForm>) => {
    const changedFilter = { ...filter, ...nextFilter };
    setFilter(changedFilter);
  };

  return { filter, changeFilter };
};
