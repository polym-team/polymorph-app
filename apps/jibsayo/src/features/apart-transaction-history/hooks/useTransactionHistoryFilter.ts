import { ApartDetailTradeHistoryItem } from '@/app/api/apart/types';

import { useState } from 'react';

import { PeriodValue } from '../models/types';
import { calculateSizes } from '../services/calculator';

interface Return {
  selectedPeriod: PeriodValue;
  selectedSizes: Set<number>;
  changePeriod: (value: PeriodValue) => void;
  changeSizes: (value: Set<number>) => void;
}

export const useTransactionHistoryFilter = (
  tradeItems: ApartDetailTradeHistoryItem[]
): Return => {
  const [selectedPeriod, setPeriod] = useState<PeriodValue>('60');
  const [selectedSizes, setSelectedSizes] = useState<Set<number>>(
    new Set(calculateSizes(tradeItems))
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
