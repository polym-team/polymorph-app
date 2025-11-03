import { firstRegionCode, getCityNameWithRegionCode } from '@/entities/region';
import { useTransactionPageSearchParams } from '@/entities/transaction';

import { useState } from 'react';

import { SearchForm } from '../models/types';
import { getDefaultDate } from '../services/calculator';

interface Return {
  form: SearchForm;
  changeForm: (value: Partial<SearchForm>) => void;
}

export const useSearchForm = (): Return => {
  const { searchParams } = useTransactionPageSearchParams();

  const [form, setForm] = useState<SearchForm>(() => {
    const defaultRegionCode = searchParams.regionCode || firstRegionCode;
    const defaultTradeDate = searchParams.tradeDate
      ? new Date(
          Number(searchParams.tradeDate.slice(0, 4)),
          Number(searchParams.tradeDate.slice(4, 6)) - 1
        )
      : getDefaultDate();

    return {
      cityName: getCityNameWithRegionCode(defaultRegionCode),
      regionCode: defaultRegionCode,
      tradeDate: defaultTradeDate,
    };
  });

  const changeForm = (value: Partial<SearchForm>) => {
    setForm({ ...form, ...value });
  };

  return {
    form,
    changeForm,
  };
};
