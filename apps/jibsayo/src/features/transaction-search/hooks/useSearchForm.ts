import { getCityNameWithRegionCode } from '@/entities/region';
import { useTransactionPageSearchParams } from '@/entities/transaction';

import { useState } from 'react';

import { getDefaultDate, getDefaultRegionCode } from '../services';
import { SearchForm } from '../types';

interface Return {
  searchForm: SearchForm;
  updateSearchForm: (value: Partial<SearchForm>) => void;
}

export const useSearchForm = (): Return => {
  const { searchParams } = useTransactionPageSearchParams();

  const [searchForm, setSearchForm] = useState<SearchForm>(() => {
    const defaultRegionCode = getDefaultRegionCode(searchParams);
    const defaultTradeDate = getDefaultDate(searchParams);
    const defaultCityName = getCityNameWithRegionCode(defaultRegionCode);

    return {
      cityName: defaultCityName,
      regionCode: defaultRegionCode,
      tradeDate: defaultTradeDate,
    };
  });

  const updateSearchForm = (value: Partial<SearchForm>) => {
    setSearchForm({ ...searchForm, ...value });
  };

  return { searchForm, updateSearchForm };
};
