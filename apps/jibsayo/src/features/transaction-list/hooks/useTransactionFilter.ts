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
  const { searchParams } = useSearchParams();
  const navigationSearchParams = useNavigationSearchParams();
  const { updateQueryParams } = useQueryParamsManager();

  const [filterState, setFilterState] =
    useState<TransactionFilter>(initialState);

  const setFilter = (nextFilter: Partial<TransactionFilter>) => {
    console.log('🔧 setFilter called:', {
      nextFilter,
      currentState: filterState,
    });

    const changedFilter = { ...filterState, ...nextFilter };
    setFilterState(changedFilter);

    // 새로운 중앙화된 쿼리파라미터 관리 사용
    updateQueryParams({
      type: 'FILTER_UPDATE',
      payload: {
        apartName: changedFilter.apartName,
        nationalSizeOnly: changedFilter.isNationalSizeOnly,
        favoriteOnly: changedFilter.isFavoriteOnly,
        newTransactionOnly: changedFilter.isNewTransactionOnly,
      },
    });
  };

  // 쿼리파라미터와 필터 상태 동기화
  useEffect(() => {
    const filterFromParams = searchParamsToFilter(navigationSearchParams);
    setFilterState(filterFromParams);
  }, [navigationSearchParams]); // 모든 쿼리파라미터 변경 시마다 실행

  // 지역/날짜 변경 감지는 이제 useQueryParamsManager에서 처리됨

  return {
    filter: filterState,
    setFilter: setFilter,
  };
};
