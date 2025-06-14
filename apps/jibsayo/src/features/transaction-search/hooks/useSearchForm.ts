import {
  cityNameList,
  getCityNameWithRegionCode,
  getRegionsWithCityName,
} from '@/entities/region';
import { useSearchParams } from '@/entities/transaction';

import { useState } from 'react';

import { SearchForm } from '../models/types';
import { parseTradeDate } from '../services/date';

interface Return {
  form: SearchForm;
  updateCityName: (nextCityName: string) => void;
  updateRegionCode: (nextRegionCode: string) => void;
  updateDate: (nextDate: Date) => void;
  onSubmit: (nextForm?: Partial<SearchForm>) => void;
}

export const useSearchForm = (): Return => {
  const { searchParams, setSearchParams } = useSearchParams();

  const [form, setForm] = useState<SearchForm>(() => {
    if (searchParams.regionCode && searchParams.tradeDate) {
      return {
        cityName: getCityNameWithRegionCode(searchParams.regionCode),
        regionCode: searchParams.regionCode,
        date: parseTradeDate(searchParams.tradeDate),
      };
    }

    return {
      cityName: cityNameList[0],
      regionCode: getRegionsWithCityName(cityNameList[0])[0].code,
      date: new Date(),
    };
  });

  const updateCityName = (nextCityName: string) => {
    if (!nextCityName) return;

    const regions = getRegionsWithCityName(nextCityName);
    const firstRegionCode = regions[0]?.code ?? '';

    setForm(prev => ({
      ...prev,
      cityName: nextCityName,
      regionCode: firstRegionCode,
    }));
  };

  const updateRegionCode = (nextRegionCode: string) => {
    if (!nextRegionCode) return;

    const cityName = getCityNameWithRegionCode(nextRegionCode);

    setForm(prev => ({
      ...prev,
      cityName,
      regionCode: nextRegionCode,
    }));
  };

  const updateDate = (nextDate: Date) => {
    setForm(prev => ({ ...prev, date: nextDate }));
  };

  const onSubmit = (nextForm?: Partial<SearchForm>) => {
    const changedForm = { ...form, ...nextForm };
    const year = changedForm.date.getFullYear();
    const month = String(changedForm.date.getMonth() + 1).padStart(2, '0');
    const tradeDate = year + month;

    updateCityName(changedForm.cityName);
    updateRegionCode(changedForm.regionCode);
    updateDate(changedForm.date);

    setSearchParams({
      regionCode: changedForm.regionCode,
      tradeDate,
    });
  };

  return {
    form,
    updateCityName,
    updateRegionCode,
    updateDate,
    onSubmit,
  };
};
