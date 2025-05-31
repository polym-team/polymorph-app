import { TransactionsResponse } from '@/app/api/transactions/types';
import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';

import { useSearchParams } from 'next/navigation';

import { calculateAveragePrice } from '../services/calculator';

export function useTransactionData(
  filteredTransactions: TransactionsResponse['list']
) {
  const searchParams = useSearchParams();

  const regionCode = searchParams.get('regionCode');
  const totalCount = filteredTransactions.length;
  const averagePrice = calculateAveragePrice(filteredTransactions);

  const cityName = regionCode ? getCityNameWithRegionCode(regionCode) : '';
  const regionName = regionCode ? getRegionNameWithRegionCode(regionCode) : '';
  const fullRegionName =
    cityName && regionName ? `${cityName} ${regionName}` : '';

  return {
    totalCount,
    averagePrice,
    fullRegionName,
  };
}
