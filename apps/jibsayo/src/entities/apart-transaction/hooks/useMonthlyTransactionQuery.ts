import { useQuery, UseQueryResult } from '@tanstack/react-query';

import {
  FetchMonthlyTransactionRequest,
  FetchMonthlyTransactionResponse,
} from '../types';

export const useMonthlyTransactionQuery = (
  params: FetchMonthlyTransactionRequest
): UseQueryResult<FetchMonthlyTransactionResponse, unknown> => {
  const urlSearchParams = new URLSearchParams();

  if (params.sizes)
    urlSearchParams.append('sizes', JSON.stringify(params.sizes));
  if (params.period) urlSearchParams.append('period', params.period.toString());

  const searchParams = urlSearchParams.toString();

  return useQuery({
    queryKey: ['monthlyTransactionQuery', params.apartId, searchParams],
    queryFn: async () => {
      const response = await fetch(
        `/api/transactions/monthly/${params.apartId}?${searchParams}`
      );

      return response.json();
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
  });
};
