import { firstRegionCode, getCityNameWithRegionCode } from '@/entities/region';
import { useSearchParams } from '@/entities/transaction';

import { useState } from 'react';

import { SearchForm } from '../models/types';

interface Return {
  form: SearchForm;
  changeForm: (value: Partial<SearchForm>) => void;
}

export const useSearchForm = (): Return => {
  const { searchParams } = useSearchParams();

  const [form, setForm] = useState<SearchForm>(() => {
    const defaultRegionCode = searchParams.regionCode || firstRegionCode;
    const defaultTradeDate = searchParams.tradeDate
      ? new Date(
          Number(searchParams.tradeDate.slice(0, 4)),
          Number(searchParams.tradeDate.slice(4, 6)) - 1
        )
      : new Date();

    return {
      cityName: getCityNameWithRegionCode(defaultRegionCode),
      regionCode: defaultRegionCode,
      tradeDate: defaultTradeDate,
    };
  });

  const changeForm = (value: Partial<SearchForm>) => {
    const afterValue = { ...form, ...value };
    const afterValueWithCityName = {
      ...afterValue,
      cityName: getCityNameWithRegionCode(afterValue.regionCode),
    };

    setForm(afterValueWithCityName);
  };

  return {
    form,
    changeForm,
  };
};
