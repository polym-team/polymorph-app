import { ApartTransactionItem } from '@/entities/apart-transaction';
import { useOnceEffect } from '@/shared/hooks/useOnceEffect';

import { useState } from 'react';

import { toast } from '@package/ui';

import { calculateAllSizes } from '../services';
import { PeriodValue } from '../types';

interface Return {
  selectedPeriod: PeriodValue;
  selectedSizes: Set<number>;
  changePeriod: (value: PeriodValue) => void;
  changeSizes: (value: Set<number>) => void;
}

export const useTransactionFilter = (
  transactionItems: ApartTransactionItem[]
): Return => {
  const [selectedPeriod, setPeriod] = useState<PeriodValue>(60);
  const [selectedSizes, setSelectedSizes] = useState<Set<number>>(new Set());

  useOnceEffect(transactionItems.length > 0, () => {
    setSelectedSizes(new Set(calculateAllSizes(transactionItems)));
  });

  const changePeriod = (value: PeriodValue) => {
    setPeriod(value);
  };

  const changeSizes = (value: Set<number>) => {
    if (value.size === 0) {
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
