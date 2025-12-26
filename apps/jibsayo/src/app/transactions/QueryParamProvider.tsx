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
    if (!isInitialized) return;

    setItem(STORAGE_KEY.TRANSACTION_QUERY_PARAMS, searchParams);
  }, [isInitialized, searchParams]);

  useOnceEffect(true, () => {
    const savedSearchParams = getItem<SearchParams>(
      STORAGE_KEY.TRANSACTION_QUERY_PARAMS
    );

    if (savedSearchParams) {
      setSearchParams({
        ...savedSearchParams,
        maxDealAmount: savedSearchParams.maxDealAmount ?? Infinity,
        maxHouseholdCount: savedSearchParams.maxHouseholdCount ?? Infinity,
        maxSize: savedSearchParams.maxSize ?? Infinity,
      });
    }

    setIsInitialized(true);
  });

  if (!isInitialized) return null;

  return children;
}
