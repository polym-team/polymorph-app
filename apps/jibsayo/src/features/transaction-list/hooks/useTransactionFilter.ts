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

// TransactionFilter를 쿼리파라미터로 변환하는 헬퍼 함수
const filterToSearchParams = (filter: TransactionFilter) => {
  const params: Record<string, string> = {};

  if (filter.apartName) {
    params.apartName = filter.apartName;
  }
  if (filter.isNationalSizeOnly) {
    params.nationalSizeOnly = 'true';
  }
  if (filter.isFavoriteOnly) {
    params.favoriteOnly = 'true';
  }
  if (filter.isNewTransactionOnly) {
    params.newTransactionOnly = 'true';
  }

  return params;
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

    // 기존 쿼리파라미터 유지하면서 필터만 업데이트
    const filterParams = filterToSearchParams(changedFilter);
    setSearchParams({
      ...(searchParams.regionCode && { regionCode: searchParams.regionCode }),
      ...(searchParams.tradeDate && { tradeDate: searchParams.tradeDate }),
      ...filterParams,
    });
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
      // 필터 관련 쿼리파라미터만 제거하고 regionCode, tradeDate는 유지
      setSearchParams({
        ...(searchParams.regionCode && { regionCode: searchParams.regionCode }),
        ...(searchParams.tradeDate && { tradeDate: searchParams.tradeDate }),
      });
    }

    prevSearchParams.current = currentSearchParams;
  }, [searchParams.regionCode, searchParams.tradeDate, setSearchParams]);

  return {
    filter: filterState,
    setFilter: setFilter,
  };
};
