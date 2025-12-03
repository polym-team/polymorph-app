import { useQuery, UseQueryResult } from '@tanstack/react-query';

import {
  FetchApartTransactionListRequest,
  FetchApartTransactionListResponse,
} from './types';

export const useApartTransactionListQuery = (
  params: FetchApartTransactionListRequest
): UseQueryResult<FetchApartTransactionListResponse, unknown> => {
  return useQuery({
    queryKey: ['apartTransactionListQuery', params.apartToken],
    queryFn: async () => {
      const response = await fetch(`/api/transactions/${params.apartToken}`);

      return response.json();
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
  });
};
