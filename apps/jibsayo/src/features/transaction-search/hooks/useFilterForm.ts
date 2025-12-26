import { useTransactionPageSearchParams } from '@/entities/transaction';

import { FilterForm } from '../types';

interface Return {
  filterForm: FilterForm;
  updateFilterForm: (value: Partial<FilterForm>) => void;
}

export const useFilterForm = (): Return => {
  const { searchParams, setSearchParams } = useTransactionPageSearchParams();

  const filterForm: FilterForm = {
    apartName: searchParams.apartName,
    minDealAmount: searchParams.minDealAmount,
    maxDealAmount: searchParams.maxDealAmount,
    minHouseholdCount: searchParams.minHouseholdCount,
    maxHouseholdCount: searchParams.maxHouseholdCount,
    minSize: searchParams.minSize,
    maxSize: searchParams.maxSize,
    favoriteOnly: searchParams.favoriteOnly,
    newTransactionOnly: searchParams.newTransactionOnly,
  };

  const updateFilterForm = (nextFilter: Partial<FilterForm>) => {
    setSearchParams({ ...searchParams, ...nextFilter, pageIndex: 0 });
  };

  return { filterForm, updateFilterForm };
};
