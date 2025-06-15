import { TransactionsResponse } from '@/app/api/transactions/types';
import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { getItem, setItem } from '@/shared/lib/sessionStorage';
import {
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';

import { useEffect, useMemo, useState } from 'react';

import { useSearchParams } from './useSearchParams';

export const useTransactionListQuery = (): UseQueryResult<
  TransactionsResponse,
  unknown
> => {
  const { searchParams } = useSearchParams();
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();

  const queryKey = useMemo(
    () => ['transactionList', searchParams],
    [searchParams]
  );

  const storageKey = useMemo(
    () =>
      `${STORAGE_KEY.TRANSACTION_LIST_RESPONSE}__${searchParams.regionCode}__${searchParams.tradeDate}`,
    [searchParams.regionCode, searchParams.tradeDate]
  );

  // 초기 데이터 로드
  useEffect(() => {
    const storedData = getItem<TransactionsResponse>(storageKey);
    if (storedData) {
      queryClient.setQueryData(queryKey, storedData);
    }
    setIsInitialized(true);
  }, [searchParams.regionCode, searchParams.tradeDate]);

  const query = useQuery({
    queryKey,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
    enabled: isInitialized,
    queryFn: async () => {
      const response = await fetch(
        `/api/transactions?area=${searchParams.regionCode}&createDt=${searchParams.tradeDate}`
      );
      return response.json();
    },
  });

  // 데이터 저장
  useEffect(() => {
    if (!query.data) return;

    const hasStorageData = getItem<TransactionsResponse>(storageKey);
    if (!hasStorageData) {
      setItem(storageKey, query.data);
    }
  }, [query.data, storageKey]);

  return query;
};
