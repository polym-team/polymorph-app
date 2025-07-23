import { useSearchParams } from '@/entities/transaction';
import { useQueryParamsManager } from '@/shared/hooks/useQueryParamsManager';

import { useSearchParams as useNavigationSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { TransactionFilter } from '../models/types';

interface Return {
  filter: TransactionFilter;
  setFilter: (value: Partial<TransactionFilter>) => void;
}

const initialState: TransactionFilter = {
  apartName: '',
  minSize: 0,
  maxSize: 50,
  isFavoriteOnly: false,
  isNewTransactionOnly: false,
};

// 쿼리파라미터에서 boolean 값을 읽어오는 헬퍼 함수
const getBooleanFromSearchParams = (value: string | null): boolean => {
  return value === 'true';
};

// 쿼리파라미터에서 number 값을 읽어오는 헬퍼 함수
const getNumberFromSearchParams = (
  value: string | null,
  defaultValue: number
): number => {
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

// 쿼리파라미터에서 TransactionFilter를 읽어오는 헬퍼 함수
const searchParamsToFilter = (
  searchParams: URLSearchParams
): TransactionFilter => {
  return {
    apartName: searchParams.get('apartName') || '',
    minSize: getNumberFromSearchParams(searchParams.get('minSize'), 0),
    maxSize: getNumberFromSearchParams(searchParams.get('maxSize'), 50),
    isFavoriteOnly: getBooleanFromSearchParams(
      searchParams.get('favoriteOnly')
    ),
    isNewTransactionOnly: getBooleanFromSearchParams(
      searchParams.get('newTransactionOnly')
    ),
  };
};

export const useTransactionFilter = (): Return => {
  const { searchParams } = useSearchParams();
  const navigationSearchParams = useNavigationSearchParams();
  const { updateQueryParams } = useQueryParamsManager();

  const [filterState, setFilterState] =
    useState<TransactionFilter>(initialState);

  const setFilter = (nextFilter: Partial<TransactionFilter>) => {
    const changedFilter = { ...filterState, ...nextFilter };
    setFilterState(changedFilter);

    // 새로운 중앙화된 쿼리파라미터 관리 사용
    updateQueryParams({
      type: 'FILTER_UPDATE',
      payload: {
        apartName: changedFilter.apartName,
        minSize: changedFilter.minSize,
        maxSize: changedFilter.maxSize,
        favoriteOnly: changedFilter.isFavoriteOnly,
        newTransactionOnly: changedFilter.isNewTransactionOnly,
      },
    });
  };

  // 쿼리파라미터와 필터 상태 동기화
  useEffect(() => {
    const filterFromParams = searchParamsToFilter(navigationSearchParams);

    // 쿼리파라미터에서 minSize, maxSize가 없으면 기본값으로 설정
    const finalFilter = {
      ...filterFromParams,
      minSize:
        filterFromParams.minSize === 0 && filterFromParams.maxSize === 0
          ? 0
          : filterFromParams.minSize,
      maxSize:
        filterFromParams.minSize === 0 && filterFromParams.maxSize === 0
          ? 50
          : filterFromParams.maxSize,
    };

    setFilterState(finalFilter);
  }, [navigationSearchParams]); // 모든 쿼리파라미터 변경 시마다 실행

  // 지역/날짜 변경 감지는 이제 useQueryParamsManager에서 처리됨

  return {
    filter: filterState,
    setFilter: setFilter,
  };
};
