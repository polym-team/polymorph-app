import {
  cityNameList,
  getCityNameWithRegionCode,
  getRegionsWithCityName,
} from '@/entities/region';
import { useSearchParams } from '@/entities/transaction';
import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { getItem, setItem } from '@/shared/lib/sessionStorage';

import { useSearchParams as useNavigationSearchParams } from 'next/navigation';
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
  const { searchParams, setSearchParams } = useSearchParams();
  const navigationSearchParams = useNavigationSearchParams();

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

    setItem(STORAGE_KEY.TRANSACTION_SEARCH_FORM, {
      regionCode: changedForm.regionCode,
      tradeDate,
    });

    // 기존 필터 파라미터들을 유지하면서 regionCode, tradeDate만 업데이트
    const newParams: Record<string, string> = {};

    // 기존 파라미터들 복사 (regionCode, tradeDate 제외)
    navigationSearchParams.forEach((value, key) => {
      if (key !== 'regionCode' && key !== 'tradeDate') {
        newParams[key] = value;
      }
    });

    // 새로운 regionCode, tradeDate 설정
    newParams.regionCode = changedForm.regionCode;
    newParams.tradeDate = tradeDate;

    console.log('🔍 useSearchForm setSearchParams:', newParams);

    setSearchParams(newParams);
  };

  useEffect(() => {
    if (searchParams.regionCode && searchParams.tradeDate) return;

    const savedSearchForm = getItem<{
      regionCode: string;
      tradeDate: string;
    }>(STORAGE_KEY.TRANSACTION_SEARCH_FORM);

    if (savedSearchForm) {
      // 저장된 tradeDate를 그대로 사용
      const newParams: Record<string, string> = {};

      // 기존 파라미터들 복사 (regionCode, tradeDate 제외)
      navigationSearchParams.forEach((value, key) => {
        if (key !== 'regionCode' && key !== 'tradeDate') {
          newParams[key] = value;
        }
      });

      // 저장된 regionCode, tradeDate 설정
      newParams.regionCode = savedSearchForm.regionCode;
      newParams.tradeDate = savedSearchForm.tradeDate;

      console.log('🔍 useSearchForm useEffect setSearchParams:', newParams);

      setSearchParams(newParams);
    }
  }, [navigationSearchParams, setSearchParams]);

  return {
    form,
    updateCityName,
    updateRegionCode,
    updateDate,
    onSubmit,
  };
};
