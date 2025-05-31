import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { SearchForm } from '../models/types';
import {
  cityNameList,
  getCityNameWithRegionCode,
  getRegionsWithCityName,
} from '../services/region';

interface Return {
  form: SearchForm;
  handleChangeCityName: (nextCityName: string) => void;
  handleChangeRegionCode: (nextRegionCode: string) => void;
  handleChangeDate: (nextDate: Date | undefined) => void;
}

export const useSearchForm = (): Return => {
  const searchParams = useSearchParams();

  const [form, setForm] = useState<SearchForm>(() => {
    const defaultCityName = cityNameList[0];
    const defaultRegionCode = getRegionsWithCityName(defaultCityName)[0].code;

    return {
      cityName: defaultCityName,
      regionCode: defaultRegionCode,
      date: new Date(),
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
    const regionCode = searchParams.get('regionCode');
    const tradeDate = searchParams.get('tradeDate');

    if (regionCode && tradeDate) {
      setForm(prev => ({
        ...prev,
        tradeDate: new Date(tradeDate),
        cityName: getCityNameWithRegionCode(regionCode),
        regionCode: regionCode,
      }));
    }
  }, [searchParams]);

  return {
    form,
    handleChangeCityName,
    handleChangeRegionCode,
    handleChangeDate,
  };
};
