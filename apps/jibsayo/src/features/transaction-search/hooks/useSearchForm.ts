import {
  cityNameList,
  getCityNameWithRegionCode,
  getRegionsWithCityName,
} from '@/entities/region';
import { useSearchParams } from '@/entities/transaction';
import { useQueryParamsManager } from '@/shared/hooks/useQueryParamsManager';

import { useEffect, useState } from 'react';

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
  const { searchParams } = useSearchParams();
  const { updateQueryParams } = useQueryParamsManager();

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

  // searchParams가 변경되면 form도 업데이트
  useEffect(() => {
    if (searchParams.regionCode && searchParams.tradeDate) {
      setForm(prev => ({
        ...prev,
        cityName: getCityNameWithRegionCode(searchParams.regionCode!),
        regionCode: searchParams.regionCode!,
        date: parseTradeDate(searchParams.tradeDate!),
      }));
    }
  }, [searchParams.regionCode, searchParams.tradeDate]);

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

    // 새로운 중앙화된 쿼리파라미터 관리 사용 (세션 스토리지 자동 저장 포함)
    updateQueryParams({
      type: 'SEARCH_UPDATE',
      payload: {
        regionCode: changedForm.regionCode,
        tradeDate,
        currentRegionCode: searchParams.regionCode,
      },
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
