import { useSearchParams } from '@/entities/transaction';

import { useSearchParams as useNavigationSearchParams } from 'next/navigation';
import { useCallback } from 'react';

interface SearchUpdate {
  type: 'SEARCH_UPDATE';
  regionCode: string;
  tradeDate: string;
  currentRegionCode?: string; // 이전 지역코드 (apartName 초기화 판단용)
}

interface FilterUpdate {
  type: 'FILTER_UPDATE';
  apartName?: string;
  nationalSizeOnly?: boolean;
  favoriteOnly?: boolean;
  newTransactionOnly?: boolean;
}

interface PageUpdate {
  type: 'PAGE_UPDATE';
  pageIndex: number;
}

type QueryParamsUpdate = SearchUpdate | FilterUpdate | PageUpdate;

export const useQueryParamsManager = () => {
  const { setSearchParams } = useSearchParams();
  const navigationSearchParams = useNavigationSearchParams();

  const getCurrentParams = useCallback(() => {
    const params: Record<string, string> = {};
    navigationSearchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [navigationSearchParams]);

  const updateQueryParams = useCallback(
    (update: QueryParamsUpdate) => {
      const currentParams = getCurrentParams();
      let newParams: Record<string, string> = {};

      console.log('🎯 QueryParamsManager update:', update.type, update);
      console.log('📋 Current params:', currentParams);

      switch (update.type) {
        case 'SEARCH_UPDATE': {
          // 검색 시: regionCode, tradeDate 변경
          newParams.regionCode = update.regionCode;
          newParams.tradeDate = update.tradeDate;

          // pageIndex는 0으로 초기화
          newParams.pageIndex = '0';

          // regionCode가 변경되는 경우 apartName 초기화
          const regionChanged = update.currentRegionCode !== update.regionCode;
          if (!regionChanged && currentParams.apartName) {
            newParams.apartName = currentParams.apartName;
            console.log(
              '✅ Keeping apartName (same region):',
              currentParams.apartName
            );
          } else {
            console.log('🚫 Clearing apartName (region changed)');
          }

          // 다른 필터들은 유지
          if (currentParams.nationalSizeOnly)
            newParams.nationalSizeOnly = currentParams.nationalSizeOnly;
          if (currentParams.favoriteOnly)
            newParams.favoriteOnly = currentParams.favoriteOnly;
          if (currentParams.newTransactionOnly)
            newParams.newTransactionOnly = currentParams.newTransactionOnly;

          break;
        }

        case 'FILTER_UPDATE': {
          // 필터 변경 시: pageIndex 0으로 초기화
          newParams = { ...currentParams };
          newParams.pageIndex = '0';

          // 필터 값들 업데이트
          if (update.apartName !== undefined) {
            if (update.apartName && update.apartName.trim()) {
              newParams.apartName = update.apartName;
            } else {
              delete newParams.apartName;
            }
          }
          if (update.nationalSizeOnly !== undefined) {
            newParams.nationalSizeOnly = update.nationalSizeOnly.toString();
          }
          if (update.favoriteOnly !== undefined) {
            newParams.favoriteOnly = update.favoriteOnly.toString();
          }
          if (update.newTransactionOnly !== undefined) {
            newParams.newTransactionOnly = update.newTransactionOnly.toString();
          }

          break;
        }

        case 'PAGE_UPDATE': {
          // 페이지 변경 시: pageIndex만 변경, 나머지 모든 파라미터 유지
          newParams = { ...currentParams };
          newParams.pageIndex = update.pageIndex.toString();

          break;
        }
      }

      console.log(
        '🌐 Final params to set:',
        JSON.stringify(newParams, null, 2)
      );
      setSearchParams(newParams);
    },
    [getCurrentParams, setSearchParams]
  );

  return {
    updateQueryParams,
    getCurrentParams,
  };
};
