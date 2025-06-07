import {
  cityNameList,
  getCityNameWithRegionCode,
  getRegionsWithCityName,
} from '@/entities/region';
import { ROUTE_PATH } from '@/shared/consts/route';

import { useRouter, useSearchParams } from 'next/navigation';
import { Dispatch, SetStateAction, useState } from 'react';

import { SearchForm } from '../models/types';
import { parseTradeDate } from '../services/date';

interface Return {
  form: SearchForm;
  setForm: Dispatch<SetStateAction<SearchForm>>;
  onSubmit: (nextForm?: Partial<SearchForm>) => void;
}

export const useSearchForm = (): Return => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const regionCode = searchParams.get('regionCode');
  const tradeDate = searchParams.get('tradeDate');

  const [form, setForm] = useState<SearchForm>(() => {
    const defaultCityName = regionCode
      ? getCityNameWithRegionCode(regionCode)
      : cityNameList[0];
    const defaultRegionCode =
      regionCode ?? getRegionsWithCityName(defaultCityName)[0].code;
    const defaultDate = tradeDate ? parseTradeDate(tradeDate) : new Date();

    return {
      cityName: defaultCityName,
      regionCode: defaultRegionCode,
      date: defaultDate,
    };
  });

  const onSubmit = (nextForm?: Partial<SearchForm>) => {
    const changedForm = { ...form, ...nextForm };

    if (nextForm) {
      setForm(changedForm);
    }

    const year = changedForm.date.getFullYear();
    const month = String(changedForm.date.getMonth() + 1).padStart(2, '0');

    router.push(
      `${ROUTE_PATH.TRANSACTIONS}?regionCode=${changedForm.regionCode}&tradeDate=${year + month}`
    );
  };

  return {
    form,
    setForm,
    onSubmit,
  };
};
