import { ApartTransactionItem } from '@/entities/apart-transaction';
import { calculateAreaPyeong } from '@/entities/transaction';

import { subMonths } from 'date-fns';

import { PeriodValue, SizesValue } from './types';

export const calculateAllSizes = (
  tradeItems: ApartTransactionItem[]
): number[] => {
  const allSizes = Array.from(
    new Set(tradeItems.map(item => calculateAreaPyeong(item.size)))
  );
  return allSizes.sort((a, b) => a - b);
};

export const filterTradeItems = (
  tradeItems: ApartTransactionItem[],
  filters: { selectedPeriod: PeriodValue; selectedSizes: SizesValue }
): ApartTransactionItem[] => {
  const { selectedPeriod, selectedSizes } = filters;
  const now = new Date();

  return tradeItems.filter(item => {
    const tradeDate = new Date(item.tradeDate);

    const passWithPeriod =
      selectedPeriod === '0'
        ? true
        : tradeDate >= subMonths(now, Number(selectedPeriod));
    const passWithSelectedSizes = selectedSizes.has(
      calculateAreaPyeong(item.size)
    );

    return passWithPeriod && passWithSelectedSizes;
  });
};
