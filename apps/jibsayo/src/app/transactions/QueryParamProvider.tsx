'use client';

import {
  SearchParams,
  useTransactionPageSearchParams,
} from '@/entities/transaction';
import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { useOnceEffect } from '@/shared/hooks/useOnceEffect';
import { getItem, setItem } from '@/shared/lib/sessionStorage';

import { useEffect, useRef, useState } from 'react';

interface QueryParamProviderProps {
  children: React.ReactNode;
}

export function QueryParamProvider({ children }: QueryParamProviderProps) {
  const { searchParams, setSearchParams } = useTransactionPageSearchParams();
  const [isInitialized, setIsInitialized] = useState(false);
  const savedParamsRef = useRef<SearchParams | null>(null);

  useEffect(() => {
    if (!isInitialized) return;

    setItem(STORAGE_KEY.TRANSACTION_QUERY_PARAMS, searchParams);
  }, [isInitialized, searchParams]);

  useEffect(() => {
    if (!savedParamsRef.current || isInitialized) return;

    const isUrlUpdated =
      savedParamsRef.current.regionCode === searchParams.regionCode &&
      savedParamsRef.current.tradeDate === searchParams.tradeDate &&
      savedParamsRef.current.orderBy === searchParams.orderBy &&
      savedParamsRef.current.orderDirection === searchParams.orderDirection;

    if (isUrlUpdated) {
      setIsInitialized(true);
      savedParamsRef.current = null;
    }
  }, [searchParams, isInitialized]);

  useOnceEffect(true, () => {
    const savedSearchParams = getItem<SearchParams>(
      STORAGE_KEY.TRANSACTION_QUERY_PARAMS
    );

    if (savedSearchParams) {
      savedParamsRef.current = savedSearchParams;
      setSearchParams({
        ...savedSearchParams,
        maxDealAmount: savedSearchParams.maxDealAmount ?? Infinity,
        maxHouseholdCount: savedSearchParams.maxHouseholdCount ?? Infinity,
        maxSize: savedSearchParams.maxSize ?? Infinity,
      });
    } else {
      setIsInitialized(true);
    }
  });

  if (!isInitialized) return null;

  return children;
}
