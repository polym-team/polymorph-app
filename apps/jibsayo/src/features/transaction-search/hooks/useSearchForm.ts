import { getCityNameWithRegionCode } from '@/entities/region';
import { useTransactionPageSearchParams } from '@/entities/transaction';

import { useEffect, useState } from 'react';

import { SearchForm } from '../types';

interface Return {
  searchForm: SearchForm;
  updateSearchForm: (value: Partial<SearchForm>) => void;
}

export const useSearchForm = (): Return => {
  const { searchParams } = useTransactionPageSearchParams();

  const [searchForm, setSearchForm] = useState<SearchForm>({
    cityName: '',
    regionCode: '',
    tradeDate: new Date(),
  });

  const updateSearchForm = (value: Partial<SearchForm>) => {
    setSearchForm({ ...searchForm, ...value });
  };

  useEffect(() => {
    setSearchForm({
      cityName: getCityNameWithRegionCode(searchParams.regionCode),
      regionCode: searchParams.regionCode,
      tradeDate: new Date(
        Number(searchParams.tradeDate.slice(0, 4)),
        Number(searchParams.tradeDate.slice(4, 6)) - 1
      ),
    });
  }, [searchParams.regionCode, searchParams.tradeDate]);

  return { searchForm, updateSearchForm };
};
