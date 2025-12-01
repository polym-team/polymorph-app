import { ApartDetailTradeHistoryItem } from '@/app/api/apart/models/types';

import { useState } from 'react';

import { calculateAllSizes } from '../services';
import { PeriodValue } from '../types';

interface Return {
  selectedPeriod: PeriodValue;
  selectedSizes: Set<number>;
  changePeriod: (value: PeriodValue) => void;
  changeSizes: (value: Set<number>) => void;
}

export const useTransactionFilter = (
  tradeItems: ApartDetailTradeHistoryItem[]
): Return => {
  const [selectedPeriod, setPeriod] = useState<PeriodValue>('60');
  const [selectedSizes, setSelectedSizes] = useState<Set<number>>(
    new Set(calculateAllSizes(tradeItems))
  );

  const changePeriod = (value: PeriodValue) => {
    setPeriod(value);
  };

  const changeSizes = (value: Set<number>) => {
    setSelectedSizes(value);
  };

  return {
    selectedPeriod,
    selectedSizes,
    changePeriod,
    changeSizes,
  };
};
