import { firstRegionCode, getCityNameWithRegionCode } from '@/entities/region';
import { useSearchParams } from '@/entities/transaction';

import { useState } from 'react';

interface Form {
  cityName: string;
  regionCode: string;
  tradeDate: Date;
}

interface Return {
  form: Form;
  updateCityName: (nextCityName: string) => void;
  updateRegionCode: (nextRegionCode: string) => void;
  updateTradeDate: (nextTradeDate: Date | undefined) => void;
  submitForm: () => void;
}

export const useSearchForm = (): Return => {
  const { searchParams, setSearchParams } = useSearchParams();

  const [form, setForm] = useState<Form>(() => {
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

  const updateCityName = (nextCityName: string) => {
    setForm(prev => ({ ...prev, cityName: nextCityName }));
  };

  const updateRegionCode = (nextRegionCode: string) => {
    setForm(prev => ({ ...prev, regionCode: nextRegionCode }));
  };

  const updateTradeDate = (nextTradeDate: Date | undefined) => {
    if (!nextTradeDate) return;
    setForm(prev => ({ ...prev, tradeDate: nextTradeDate }));
  };

  const submitForm = () => {
    const year = form.tradeDate.getFullYear();
    const month = String(form.tradeDate.getMonth() + 1).padStart(2, '0');
    const tradeDate = year + month;

    setSearchParams({
      regionCode: form.regionCode,
      tradeDate,
      pageIndex: 0,
      apartName: '',
    });
  };

  return {
    form,
    updateCityName,
    updateRegionCode,
    updateTradeDate,
    submitForm,
  };
};
