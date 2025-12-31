import { useQuery, UseQueryResult } from '@tanstack/react-query';

import {
  FetchMonthlyTransactionsByApartsRequest,
  FetchMonthlyTransactionsByApartsResponse,
} from '../types';

export const useMonthlyTransactionsByAparts = (
  params: FetchMonthlyTransactionsByApartsRequest
): UseQueryResult<FetchMonthlyTransactionsByApartsResponse, unknown> => {
  const apartIds = params.apartIds.join(',');
  const urlSearchParams = new URLSearchParams();

  if (params.period) urlSearchParams.append('period', params.period.toString());

  if (params.sizesByApart && Object.keys(params.sizesByApart).length > 0) {
    urlSearchParams.append(
      'sizes',
      encodeURIComponent(JSON.stringify(params.sizesByApart))
    );
  }

  const searchParams = urlSearchParams.toString();

  return useQuery({
    queryKey: ['monthlyTransactionsByAparts', apartIds, searchParams],
    queryFn: async () => {
      const response = await fetch(
        `/api/transactions/by-ids/${apartIds}${searchParams ? `?${searchParams}` : ''}`
      );

      return response.json();
    },
    enabled: params.apartIds.length > 0,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
  });
};
