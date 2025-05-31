import { TransactionsResponse } from '@/app/api/transactions/types';
import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';

import { useSearchParams } from 'next/navigation';

import { calculateAveragePricePerPyeong } from '../services/calculator';

export function useTransactionData(
  filteredTransactions: TransactionsResponse['list']
) {
  const searchParams = useSearchParams();

  const regionCode = searchParams.get('regionCode');
  const totalCount = filteredTransactions.length;
  const averagePricePerPyeong =
    calculateAveragePricePerPyeong(filteredTransactions);

  const cityName = regionCode ? getCityNameWithRegionCode(regionCode) : '';
  const regionName = regionCode ? getRegionNameWithRegionCode(regionCode) : '';
  const fullRegionName =
    cityName && regionName ? `${cityName} ${regionName}` : '';

  return {
    totalCount,
    averagePricePerPyeong,
    fullRegionName,
  };
}
