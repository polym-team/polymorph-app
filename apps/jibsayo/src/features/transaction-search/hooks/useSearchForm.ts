import {
  cityNameList,
  getCityNameWithRegionCode,
  getRegionsWithCityName,
} from '@/entities/region';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { SearchForm } from '../models/types';
import { parseTradeDate } from '../services/date';

interface Return {
  form: SearchForm;
  handleChangeCityName: (nextCityName: string) => void;
  handleChangeRegionCode: (nextRegionCode: string) => void;
  handleChangeDate: (nextDate: Date | undefined) => void;
}

export const useSearchForm = (): Return => {
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

  const handleChangeCityName = (nextCityName: string) => {
    const regions = getRegionsWithCityName(nextCityName);
    const firstRegionCode = regions[0]?.code ?? '';

    setForm(prev => ({
      ...prev,
      cityName: nextCityName,
      regionCode: firstRegionCode,
    }));
  };

  const handleChangeRegionCode = (nextRegionCode: string) => {
    if (nextRegionCode) {
      setForm(prev => ({ ...prev, regionCode: nextRegionCode }));
    }
  };

  const handleChangeDate = (nextDate: Date | undefined) => {
    if (nextDate) {
      setForm(prev => ({ ...prev, date: nextDate }));
    }
  };

  useEffect(() => {
    if (regionCode && tradeDate) {
      setForm(prev => ({
        ...prev,
        date: parseTradeDate(tradeDate),
        cityName: getCityNameWithRegionCode(regionCode),
        regionCode: regionCode,
      }));
    }
  }, [regionCode, tradeDate]);

  return {
    form,
    handleChangeCityName,
    handleChangeRegionCode,
    handleChangeDate,
  };
};
