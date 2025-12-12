import { useOnceEffect } from '@/shared/hooks/useOnceEffect';

import { useState } from 'react';

import { toast } from '@package/ui';

import { PeriodValue, SizesValue } from '../types';

interface Return {
  selectedPeriod: PeriodValue;
  selectedSizes: SizesValue;
  changePeriod: (value: PeriodValue) => void;
  changeSizes: (value: SizesValue) => void;
}

export const useTransactionFilter = (allSizes: SizesValue): Return => {
  const [selectedPeriod, setPeriod] = useState<PeriodValue>(60);
  const [selectedSizes, setSelectedSizes] = useState<SizesValue>([]);

  useOnceEffect(allSizes.length > 0, () => {
    setSelectedSizes(allSizes);
  });

  const changePeriod = (value: PeriodValue) => {
    setPeriod(value);
  };

  const changeSizes = (value: SizesValue) => {
    if (value.length === 0) {
      toast.success('한 개 이상의 평형을 선택해 주세요');
      return;
    }

    setSelectedSizes(value);
  };

  return {
    selectedPeriod,
    selectedSizes,
    changePeriod,
    changeSizes,
  };
};
