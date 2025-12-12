import { calculateAllSizes } from '../services';
import { PeriodValue } from '../types';
import { useTransactionFilter } from './useTransactionFilter';

interface Return {
  isLoading: boolean;
  allSizes: number[];
  selectedPeriod: PeriodValue;
  selectedSizes: Set<number>;
  changePeriod: (value: PeriodValue) => void;
  changeSizes: (value: Set<number>) => void;
}

export const useApartTransactionList = (): Return => {
  const { selectedPeriod, selectedSizes, changePeriod, changeSizes } =
    useTransactionFilter([]);

  const allSizes = calculateAllSizes([]);

  return {
    isLoading: false,
    allSizes,
    selectedPeriod,
    selectedSizes,
    changePeriod,
    changeSizes,
  };
};
