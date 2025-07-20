import { useSearchParams } from '@/entities/transaction';

import { useSearchParams as useNavigationSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { TransactionFilter } from '../models/types';

interface Return {
  filter: TransactionFilter;
  setFilter: (value: Partial<TransactionFilter>) => void;
}

const initialState: TransactionFilter = {
  apartName: '',
  isNationalSizeOnly: false,
  isFavoriteOnly: false,
  isNewTransactionOnly: false,
};

// 쿼리파라미터에서 boolean 값을 읽어오는 헬퍼 함수
const getBooleanFromSearchParams = (value: string | null): boolean => {
  return value === 'true';
};

// 쿼리파라미터에서 TransactionFilter를 읽어오는 헬퍼 함수
const searchParamsToFilter = (
  searchParams: URLSearchParams
): TransactionFilter => {
  return {
    apartName: searchParams.get('apartName') || '',
    isNationalSizeOnly: getBooleanFromSearchParams(
      searchParams.get('nationalSizeOnly')
    ),
    isFavoriteOnly: getBooleanFromSearchParams(
      searchParams.get('favoriteOnly')
    ),
    isNewTransactionOnly: getBooleanFromSearchParams(
      searchParams.get('newTransactionOnly')
    ),
  };
};

export const useTransactionFilter = (): Return => {
  const { searchParams, setSearchParams } = useSearchParams();
  const navigationSearchParams = useNavigationSearchParams();

  const [filterState, setFilterState] =
    useState<TransactionFilter>(initialState);

  const prevSearchParams = useRef<string | undefined>(
    `${searchParams.regionCode}-${searchParams.tradeDate}`
  );

  const setFilter = (nextFilter: Partial<TransactionFilter>) => {
    const changedFilter = { ...filterState, ...nextFilter };
    setFilterState(changedFilter);

    // 모든 필터를 쿼리파라미터에 포함 (false 값도 포함)
    const newParams: Record<string, string> = {};

    // 기본 검색 파라미터 유지
    if (searchParams.regionCode) {
      newParams.regionCode = searchParams.regionCode;
    }
    if (searchParams.tradeDate) {
      newParams.tradeDate = searchParams.tradeDate;
    }

    // 모든 필터 상태를 쿼리파라미터에 포함
    if (changedFilter.apartName) {
      newParams.apartName = changedFilter.apartName;
    }
    newParams.nationalSizeOnly = changedFilter.isNationalSizeOnly.toString();
    newParams.favoriteOnly = changedFilter.isFavoriteOnly.toString();
    newParams.newTransactionOnly =
      changedFilter.isNewTransactionOnly.toString();

    setSearchParams(newParams);
  };

  // 쿼리파라미터와 필터 상태 동기화
  useEffect(() => {
    const filterFromParams = searchParamsToFilter(navigationSearchParams);
    setFilterState(filterFromParams);
  }, [navigationSearchParams]); // 모든 쿼리파라미터 변경 시마다 실행

  // 지역이나 날짜가 변경되면 필터 초기화
  useEffect(() => {
    const currentSearchParams = `${searchParams.regionCode}-${searchParams.tradeDate}`;

    if (!prevSearchParams.current) {
      prevSearchParams.current = currentSearchParams;
      return;
    }

    if (prevSearchParams.current !== currentSearchParams) {
      setFilterState(initialState);
      // 기본 검색 파라미터 유지하고 필터는 초기값으로 설정
      const newParams: Record<string, string> = {};
      if (searchParams.regionCode) {
        newParams.regionCode = searchParams.regionCode;
      }
      if (searchParams.tradeDate) {
        newParams.tradeDate = searchParams.tradeDate;
      }
      // 모든 필터를 초기값으로 명시적 설정
      newParams.nationalSizeOnly = initialState.isNationalSizeOnly.toString();
      newParams.favoriteOnly = initialState.isFavoriteOnly.toString();
      newParams.newTransactionOnly =
        initialState.isNewTransactionOnly.toString();
      setSearchParams(newParams);
    }

    prevSearchParams.current = currentSearchParams;
  }, [searchParams.regionCode, searchParams.tradeDate, setSearchParams]);

  return {
    filter: filterState,
    setFilter: setFilter,
  };
};
