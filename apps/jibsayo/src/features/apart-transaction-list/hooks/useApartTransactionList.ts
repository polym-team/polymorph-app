import { ApartInfoType } from '@/features/apart-info';

import { PeriodValue, SizesValue } from '../types';
import { useTransactionFilter } from './useTransactionFilter';

interface Params {
  data: ApartInfoType | undefined;
}

interface Return {
  isLoading: boolean;
  allSizes: SizesValue;
  selectedPeriod: PeriodValue;
  selectedSizes: SizesValue;
  changePeriod: (value: PeriodValue) => void;
  changeSizes: (value: SizesValue) => void;
}

export const useApartTransactionList = ({ data }: Params): Return => {
  const allSizes = data?.allSizes ?? [];

  const { selectedPeriod, selectedSizes, changePeriod, changeSizes } =
    useTransactionFilter(allSizes);

  return {
    isLoading: false,
    allSizes,
    selectedPeriod,
    selectedSizes,
    changePeriod,
    changeSizes,
  };
};
