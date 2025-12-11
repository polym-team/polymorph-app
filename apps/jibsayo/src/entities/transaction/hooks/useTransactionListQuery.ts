import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { TransactionListResponse } from '../types';
import { useTransactionPageSearchParams } from './useTransactionPageSearchParams';

export const useTransactionListQuery = (): UseQueryResult<
  TransactionListResponse,
  unknown
> => {
  const { searchParams } = useTransactionPageSearchParams();

  const urlSearchParams = new URLSearchParams();
  urlSearchParams.append('area', searchParams.regionCode);
  urlSearchParams.append('createDt', searchParams.tradeDate);
  urlSearchParams.append('pageIndex', searchParams.pageIndex.toString());
  urlSearchParams.append('pageSize', '15');
  urlSearchParams.append('apartName', searchParams.apartName);
  urlSearchParams.append('minSize', searchParams.minSize.toString());
  urlSearchParams.append('maxSize', searchParams.maxSize.toString());
  urlSearchParams.append(
    'newTransactionOnly',
    searchParams.newTransactionOnly.toString()
  );
  urlSearchParams.append(
    'newTransactionOnly',
    searchParams.newTransactionOnly.toString()
  );
  urlSearchParams.append('orderBy', searchParams.orderBy);
  urlSearchParams.append('orderDirection', searchParams.orderDirection);

  return useQuery({
    queryKey: [
      'transactionListQuery',
      [
        searchParams.regionCode,
        searchParams.tradeDate,
        searchParams.pageIndex,
        searchParams.apartName,
        searchParams.minSize,
        searchParams.maxSize,
        searchParams.newTransactionOnly,
        searchParams.orderBy,
        searchParams.orderDirection,
      ],
    ],
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
    enabled: !!searchParams.regionCode && !!searchParams.tradeDate,
    queryFn: async () => {
      const response = await fetch(
        `/api/transactions?${urlSearchParams.toString()}`
      );
      return response.json();
    },
  });
};
