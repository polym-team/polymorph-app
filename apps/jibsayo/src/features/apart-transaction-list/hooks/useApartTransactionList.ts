import { ApartDetailResponse } from '@/app/api/apart/models/types';

import { calculateAllSizes, filterTradeItems } from '../services';
import { PeriodValue } from '../types';
import { useTransactionFilter } from './useTransactionFilter';

interface Params {
  data: ApartDetailResponse;
}

interface Return {
  allSizes: number[];
  selectedPeriod: PeriodValue;
  selectedSizes: Set<number>;
  filteredTradeItems: ApartDetailResponse['tradeItems'];
  changePeriod: (value: PeriodValue) => void;
  changeSizes: (value: Set<number>) => void;
}

export const useApartTransactionList = ({ data }: Params): Return => {
  const { selectedPeriod, selectedSizes, changePeriod, changeSizes } =
    useTransactionFilter(data.tradeItems);

  const allSizes = calculateAllSizes(data.tradeItems);
  const filteredTradeItems = filterTradeItems(data.tradeItems, {
    selectedPeriod,
    selectedSizes,
  });

  return {
    allSizes,
    selectedPeriod,
    selectedSizes,
    filteredTradeItems,
    changePeriod,
    changeSizes,
  };
};
