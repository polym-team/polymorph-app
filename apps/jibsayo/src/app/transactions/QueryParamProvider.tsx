'use client';

import {
  SearchParams,
  useTransactionPageSearchParams,
} from '@/entities/transaction';
import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { useOnceEffect } from '@/shared/hooks/useOnceEffect';
import { getItem, setItem } from '@/shared/lib/sessionStorage';

import { useEffect, useState } from 'react';

interface QueryParamProviderProps {
  children: React.ReactNode;
}

export function QueryParamProvider({ children }: QueryParamProviderProps) {
  const { searchParams, setSearchParams } = useTransactionPageSearchParams();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const isEmpty = !searchParams.regionCode || !searchParams.tradeDate;
    if (isEmpty) return;

    setItem(STORAGE_KEY.TRANSACTION_QUERY_PARAMS, searchParams);
  }, [searchParams]);

  useOnceEffect(!!searchParams.regionCode && !!searchParams.tradeDate, () => {
    setIsInitialized(true);
  });

  useOnceEffect(true, () => {
    const savedSearchParams = getItem<SearchParams>(
      STORAGE_KEY.TRANSACTION_QUERY_PARAMS
    );

    if (!savedSearchParams) {
      setIsInitialized(true);
      return;
    }

    setSearchParams({
      ...savedSearchParams,
      maxSize: savedSearchParams.maxSize ?? Infinity,
    });
  });

  if (!isInitialized) return null;

  return children;
}
