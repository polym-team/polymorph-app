'use client';

import {
  hasRequiredUrlParams,
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

  useOnceEffect(true, () => {
    const hasUrlParams = hasRequiredUrlParams(searchParams);

    // 케이스 1: URL에 쿼리파라미터가 있는 경우 -> 바로 렌더링
    if (hasUrlParams) {
      setIsInitialized(true);
      return;
    }

    const savedParams = getItem<SearchParams>(
      STORAGE_KEY.TRANSACTION_QUERY_PARAMS
    );

    // 케이스 2: URL X + 스토리지 O -> 복원 후 렌더링
    if (savedParams) {
      setSearchParams({
        ...savedParams,
        maxDealAmount: savedParams.maxDealAmount ?? Infinity,
        maxHouseholdCount: savedParams.maxHouseholdCount ?? Infinity,
        maxSize: savedParams.maxSize ?? Infinity,
      });
      setTimeout(() => setIsInitialized(true), 50);
      return;
    }

    // 케이스 3: 둘 다 X -> 바로 렌더링
    setIsInitialized(true);
  });

  // 세션 스토리지에 저장
  useEffect(() => {
    if (!isInitialized) return;

    setItem(STORAGE_KEY.TRANSACTION_QUERY_PARAMS, searchParams);
  }, [isInitialized, searchParams]);

  if (!isInitialized) return null;

  return children;
}
