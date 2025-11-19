import { useTransactionPageSearchParams } from '@/entities/transaction';

import { FilterForm } from '../models/types';

interface Return {
  appliedFilter: FilterForm;
  applyFilter: (value: Partial<FilterForm>) => void;
}

export const useFilterForm = (): Return => {
  const { searchParams, setSearchParams } = useTransactionPageSearchParams();

  const appliedFilter: FilterForm = {
    apartName: searchParams.apartName,
    minSize: searchParams.minSize,
    maxSize: searchParams.maxSize,
    favoriteOnly: searchParams.favoriteOnly,
    newTransactionOnly: searchParams.newTransactionOnly,
  };

  const applyFilter = (nextFilter: Partial<FilterForm>) => {
    setSearchParams({ ...searchParams, ...nextFilter });
  };

  return { appliedFilter, applyFilter };
};
