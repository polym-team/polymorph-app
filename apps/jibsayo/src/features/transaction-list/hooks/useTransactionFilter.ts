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

  const prevSearchParams = useRef<{
    regionCode: string | undefined;
    tradeDate: string | undefined;
  }>({
    regionCode: searchParams.regionCode,
    tradeDate: searchParams.tradeDate,
  });

  const setFilter = (nextFilter: Partial<TransactionFilter>) => {
    const changedFilter = { ...filterState, ...nextFilter };
    setFilterState(changedFilter);

    // 필터 변경 시 기본 파라미터와 필터 상태만 유지하고 pageIndex는 0으로 리셋
    const newParams: Record<string, string> = {};

    // 기본 검색 파라미터 유지
    if (searchParams.regionCode) {
      newParams.regionCode = searchParams.regionCode;
    }
    if (searchParams.tradeDate) {
      newParams.tradeDate = searchParams.tradeDate;
    }

    // 필터 상태 업데이트
    if (changedFilter.apartName) {
      newParams.apartName = changedFilter.apartName;
    }
    newParams.nationalSizeOnly = changedFilter.isNationalSizeOnly.toString();
    newParams.favoriteOnly = changedFilter.isFavoriteOnly.toString();
    newParams.newTransactionOnly =
      changedFilter.isNewTransactionOnly.toString();

    // pageIndex는 0으로 리셋 (필터링된 새로운 목록이므로)
    newParams.pageIndex = '0';

    setSearchParams(newParams);
  };

  // 쿼리파라미터와 필터 상태 동기화
  useEffect(() => {
    const filterFromParams = searchParamsToFilter(navigationSearchParams);
    setFilterState(filterFromParams);
  }, [navigationSearchParams]); // 모든 쿼리파라미터 변경 시마다 실행

  // 지역이나 날짜가 변경되면 필터 초기화
  useEffect(() => {
    const currentRegionCode = searchParams.regionCode;
    const currentTradeDate = searchParams.tradeDate;

    if (
      !prevSearchParams.current.regionCode &&
      !prevSearchParams.current.tradeDate
    ) {
      prevSearchParams.current = {
        regionCode: currentRegionCode,
        tradeDate: currentTradeDate,
      };
      return;
    }

    const regionCodeChanged =
      prevSearchParams.current.regionCode !== currentRegionCode;
    const tradeDateChanged =
      prevSearchParams.current.tradeDate !== currentTradeDate;

    if (regionCodeChanged || tradeDateChanged) {
      const newParams: Record<string, string> = {};

      // 현재 URL의 모든 쿼리파라미터 유지
      navigationSearchParams.forEach((value, key) => {
        newParams[key] = value;
      });

      // regionCode가 변경된 경우에만 apartName 초기화
      if (regionCodeChanged) {
        setFilterState(prev => ({
          ...prev,
          apartName: '', // apartName만 초기화
        }));

        // apartName 제거 (초기화)
        delete newParams.apartName;
      }

      // pageIndex는 항상 0으로 리셋 (새로운 데이터셋이므로)
      newParams.pageIndex = '0';

      setSearchParams(newParams);
    }

    prevSearchParams.current = {
      regionCode: currentRegionCode,
      tradeDate: currentTradeDate,
    };
  }, [searchParams.regionCode, searchParams.tradeDate, setSearchParams]);

  return {
    filter: filterState,
    setFilter: setFilter,
  };
};
