import {
  useTransactionListQuery,
  useTransactionPageSearchParams,
} from '@/entities/transaction';

import { useRef } from 'react';

import { FilterForm, SearchForm } from '../types';
import { useFilterForm } from './useFilterForm';
import { useSearchForm } from './useSearchForm';

interface Return {
  isLoading: boolean;
  searchForm: SearchForm;
  filterForm: FilterForm;
  updateSearchForm: (value: Partial<SearchForm>) => void;
  updateFilterForm: (value: Partial<FilterForm>) => void;
  searchTransaction: () => void;
}

export const useTransactionSearch = (): Return => {
  const { isLoading } = useTransactionListQuery();
  const { setSearchParams } = useTransactionPageSearchParams();

  const { searchForm, updateSearchForm } = useSearchForm();
  const { filterForm, updateFilterForm } = useFilterForm();

  const beforeSearchForm = useRef<SearchForm>(searchForm);

  const searchTransaction = () => {
    const changedRegionCode =
      beforeSearchForm.current.regionCode !== searchForm.regionCode;

    setSearchParams({
      regionCode: searchForm.regionCode,
      tradeDate: `${searchForm.tradeDate.getFullYear()}${String(searchForm.tradeDate.getMonth() + 1).padStart(2, '0')}`,
      apartName: changedRegionCode ? '' : filterForm.apartName,
      minSize: filterForm.minSize,
      maxSize: filterForm.maxSize,
      favoriteOnly: filterForm.favoriteOnly,
      newTransactionOnly: filterForm.newTransactionOnly,
      pageIndex: 0,
    });

    beforeSearchForm.current = searchForm;
  };

  return {
    isLoading,
    searchForm,
    filterForm,
    updateSearchForm,
    updateFilterForm,
    searchTransaction,
  };
};
