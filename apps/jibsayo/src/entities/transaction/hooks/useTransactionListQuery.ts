import { TransactionsResponse } from '@/app/api/transactions/types';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { useTransactionPageSearchParams } from './useTransactionPageSearchParams';

export const useTransactionListQuery = (): UseQueryResult<
  TransactionsResponse,
  unknown
> => {
  const { searchParams } = useTransactionPageSearchParams();

  return useQuery({
    queryKey: [
      'transactionListQuery',
      {
        tradeDate: searchParams.tradeDate,
        regionCode: searchParams.regionCode,
      },
    ],
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
    enabled: !!searchParams.regionCode && !!searchParams.tradeDate,
    queryFn: async () => {
      const response = await fetch(
        `/api/transactions?area=${searchParams.regionCode}&createDt=${searchParams.tradeDate}`
      );
      return response.json();
    },
  });
};
