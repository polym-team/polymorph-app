import { ApartTransactionItem } from '@/entities/apart-transaction';
import { useApartTransactionListQuery } from '@/entities/apart-transaction/useApartTransactionListQuery';

import { calculateAllSizes, filterTransactionItems } from '../services';
import { PeriodValue } from '../types';
import { useTransactionFilter } from './useTransactionFilter';

interface Params {
  apartToken: string;
}

interface Return {
  isLoading: boolean;
  allSizes: number[];
  selectedPeriod: PeriodValue;
  selectedSizes: Set<number>;
  filteredTransactionItems: ApartTransactionItem[];
  changePeriod: (value: PeriodValue) => void;
  changeSizes: (value: Set<number>) => void;
}

export const useApartTransactionList = ({ apartToken }: Params): Return => {
  const { isLoading, data } = useApartTransactionListQuery({ apartToken });
  const transactionItems = data?.items ?? [];

  const { selectedPeriod, selectedSizes, changePeriod, changeSizes } =
    useTransactionFilter(transactionItems);

  const allSizes = calculateAllSizes(transactionItems);
  const filteredTransactionItems = filterTransactionItems(transactionItems, {
    selectedPeriod,
    selectedSizes,
  });

  return {
    isLoading,
    allSizes,
    selectedPeriod,
    selectedSizes,
    filteredTransactionItems,
    changePeriod,
    changeSizes,
  };
};
