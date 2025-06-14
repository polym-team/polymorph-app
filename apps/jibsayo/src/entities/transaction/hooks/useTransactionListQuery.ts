import { TransactionsResponse } from '@/app/api/transactions/types';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { useSearchParams } from './useSearchParams';

export const useTransactionListQuery = (): UseQueryResult<
  TransactionsResponse,
  unknown
> => {
  const { searchParams } = useSearchParams();

  return useQuery({
    queryKey: ['transactionList', searchParams],
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
    queryFn: async () => {
      const response = await fetch(
        `/api/transactions?area=${searchParams.regionCode}&createDt=${searchParams.tradeDate}`
      );
      return response.json();
    },
  });
};
