import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import {
  useSearchParams,
  useTransactionListQuery,
} from '@/entities/transaction';

import { calculateTransactionAverageAmount } from '../services/calculator';

interface Return {
  cityName: string;
  regionName: string;
  transactionTotalCount: number;
  transactionAverageAmount: number;
}

export const useTransactionSummary = (): Return => {
  const { data: transactions } = useTransactionListQuery();
  const { searchParams } = useSearchParams();

  const cityName = getCityNameWithRegionCode(searchParams.regionCode);
  const regionName = getRegionNameWithRegionCode(searchParams.regionCode);
  const transactionTotalCount = transactions?.list?.length ?? 0;
  const transactionAverageAmount = calculateTransactionAverageAmount(
    transactions?.list ?? []
  );

  return {
    cityName,
    regionName,
    transactionTotalCount,
    transactionAverageAmount,
  };
};
