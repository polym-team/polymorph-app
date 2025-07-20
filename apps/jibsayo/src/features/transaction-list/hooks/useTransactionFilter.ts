import { useSearchParams } from '@/entities/transaction';

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

  const [filterState, setFilterState] =
    useState<TransactionFilter>(initialState);

  const prevSearchParams = useRef<string | undefined>(
    `${searchParams.regionCode}-${searchParams.tradeDate}`
  );

  const setFilter = (nextFilter: Partial<TransactionFilter>) => {
    const changedFilter = { ...filterState, ...nextFilter };
    setFilterState(changedFilter);

    // 완전히 새로운 쿼리파라미터 구성 (기존 필터 제거 포함)
    const newParams: Record<string, string> = {};

    // 기본 검색 파라미터 유지
    if (searchParams.regionCode) {
      newParams.regionCode = searchParams.regionCode;
    }
    if (searchParams.tradeDate) {
      newParams.tradeDate = searchParams.tradeDate;
    }

    // 활성화된 필터만 포함
    if (changedFilter.apartName) {
      newParams.apartName = changedFilter.apartName;
    }
    if (changedFilter.isNationalSizeOnly) {
      newParams.nationalSizeOnly = 'true';
    }
    if (changedFilter.isFavoriteOnly) {
      newParams.favoriteOnly = 'true';
    }
    if (changedFilter.isNewTransactionOnly) {
      newParams.newTransactionOnly = 'true';
    }

    setSearchParams(newParams);
  };

  // 쿼리파라미터에서 필터 상태 초기화
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const filterFromParams = searchParamsToFilter(urlSearchParams);
      setFilterState(filterFromParams);
    }
  }, []);

  // 지역이나 날짜가 변경되면 필터 초기화
  useEffect(() => {
    const currentSearchParams = `${searchParams.regionCode}-${searchParams.tradeDate}`;

    if (!prevSearchParams.current) {
      prevSearchParams.current = currentSearchParams;
      return;
    }

    if (prevSearchParams.current !== currentSearchParams) {
      setFilterState(initialState);
      // 기본 검색 파라미터만 유지하고 필터는 모두 제거
      const newParams: Record<string, string> = {};
      if (searchParams.regionCode) {
        newParams.regionCode = searchParams.regionCode;
      }
      if (searchParams.tradeDate) {
        newParams.tradeDate = searchParams.tradeDate;
      }
      setSearchParams(newParams);
    }

    prevSearchParams.current = currentSearchParams;
  }, [searchParams.regionCode, searchParams.tradeDate, setSearchParams]);

  return {
    filter: filterState,
    setFilter: setFilter,
  };
};
