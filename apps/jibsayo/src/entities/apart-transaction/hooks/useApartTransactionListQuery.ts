import {
  keepPreviousData,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import {
  FetchApartTransactionListRequest,
  FetchApartTransactionListResponse,
} from '../types';

export const useApartTransactionListQuery = (
  params: FetchApartTransactionListRequest,
  options?: Pick<UseQueryOptions<FetchApartTransactionListResponse>, 'enabled'>
): UseQueryResult<FetchApartTransactionListResponse, unknown> => {
  const urlSearchParams = new URLSearchParams();

  urlSearchParams.append('pageIndex', params.pageIndex.toString());
  urlSearchParams.append('pageSize', params.pageSize.toString());
  if (params.sizes)
    urlSearchParams.append('sizes', JSON.stringify(params.sizes));
  if (params.period) urlSearchParams.append('period', params.period.toString());
  if (params.orderBy) urlSearchParams.append('orderBy', params.orderBy);
  if (params.orderDirection)
    urlSearchParams.append('orderDirection', params.orderDirection);

  const searchParams = urlSearchParams.toString();

  return useQuery({
    queryKey: ['apartTransactionListQuery', params.apartId, searchParams],
    queryFn: async () => {
      const response = await fetch(
        `/api/transactions/by-id/${params.apartId}?${searchParams}`
      );

      return response.json();
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
};
