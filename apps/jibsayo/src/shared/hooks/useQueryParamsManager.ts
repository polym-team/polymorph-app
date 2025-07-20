import { useSearchParams } from '@/entities/transaction';
import { ROUTE_PATH } from '@/shared/consts/route';
import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { getItem, setItem } from '@/shared/lib/sessionStorage';

import {
  useSearchParams as useNavigationSearchParams,
  useRouter,
} from 'next/navigation';
import { useCallback } from 'react';

// State 타입 정의
interface QueryParamsState {
  regionCode?: string;
  tradeDate?: string;
  apartName?: string;
  minSize?: string;
  maxSize?: string;
  favoriteOnly?: string;
  newTransactionOnly?: string;
  pageIndex?: string;
}

// Action 타입 정의
interface SearchAction {
  type: 'SEARCH_UPDATE';
  payload: {
    regionCode: string;
    tradeDate: string;
    currentRegionCode?: string;
  };
}

interface FilterAction {
  type: 'FILTER_UPDATE';
  payload: {
    apartName?: string;
    minSize?: number;
    maxSize?: number;
    favoriteOnly?: boolean;
    newTransactionOnly?: boolean;
  };
}

interface PageAction {
  type: 'PAGE_UPDATE';
  payload: {
    pageIndex: number;
  };
}

type QueryParamsAction = SearchAction | FilterAction | PageAction;

// Reducer 함수
const queryParamsReducer = (
  currentState: QueryParamsState,
  action: QueryParamsAction
): QueryParamsState => {
  switch (action.type) {
    case 'SEARCH_UPDATE': {
      const { regionCode, tradeDate, currentRegionCode } = action.payload;

      // 지역 변경 여부 확인
      const regionChanged = currentRegionCode !== regionCode;

      const newState: QueryParamsState = {
        regionCode,
        tradeDate,
        pageIndex: '0', // 검색 시 페이지 초기화

        // 지역 변경 시 apartName 초기화, 아니면 유지
        apartName: regionChanged ? '' : currentState.apartName,

        // 다른 필터들은 유지
        minSize: currentState.minSize,
        maxSize: currentState.maxSize,
        favoriteOnly: currentState.favoriteOnly,
        newTransactionOnly: currentState.newTransactionOnly,
      };

      return newState;
    }

    case 'FILTER_UPDATE': {
      const { apartName, minSize, maxSize, favoriteOnly, newTransactionOnly } =
        action.payload;

      const newState: QueryParamsState = {
        ...currentState,
        pageIndex: '0', // 필터 변경 시 페이지 초기화
      };

      // 필터 값들 업데이트
      if (apartName !== undefined) {
        newState.apartName = apartName && apartName.trim() ? apartName : '';
      }
      if (minSize !== undefined) {
        newState.minSize = minSize.toString();
      }
      if (maxSize !== undefined) {
        newState.maxSize = maxSize.toString();
      }
      if (favoriteOnly !== undefined) {
        newState.favoriteOnly = favoriteOnly.toString();
      }
      if (newTransactionOnly !== undefined) {
        newState.newTransactionOnly = newTransactionOnly.toString();
      }

      return newState;
    }

    case 'PAGE_UPDATE': {
      return {
        ...currentState,
        pageIndex: action.payload.pageIndex.toString(),
      };
    }

    default:
      return currentState;
  }
};

export const useQueryParamsManager = () => {
  const navigationSearchParams = useNavigationSearchParams();
  const router = useRouter();

  const getCurrentParams = useCallback((): QueryParamsState => {
    const params: QueryParamsState = {};
    navigationSearchParams.forEach((value, key) => {
      params[key as keyof QueryParamsState] = value;
    });
    return params;
  }, [navigationSearchParams]);

  // 세션 스토리지에 쿼리 파라미터 저장
  const saveQueryParamsToStorage = useCallback((params: QueryParamsState) => {
    // 빈 값 필터링하여 저장
    const filteredParams = Object.entries(params).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key as keyof QueryParamsState] = value;
        }
        return acc;
      },
      {} as QueryParamsState
    );

    setItem(STORAGE_KEY.TRANSACTION_QUERY_PARAMS, filteredParams);
  }, []);

  // 세션 스토리지에서 쿼리 파라미터 복원
  const restoreQueryParamsFromStorage =
    useCallback((): QueryParamsState | null => {
      return getItem<QueryParamsState>(STORAGE_KEY.TRANSACTION_QUERY_PARAMS);
    }, []);

  const updateQueryParams = useCallback(
    (
      action: Omit<QueryParamsAction, 'type'> & {
        type: QueryParamsAction['type'];
      }
    ) => {
      const currentParams = getCurrentParams();

      // Reducer를 통해 새로운 상태 계산
      const newState = queryParamsReducer(
        currentParams,
        action as QueryParamsAction
      );

      // URL 생성 - 빈 문자열과 undefined 값 제외
      const urlSearchParams = new URLSearchParams();
      Object.entries(newState).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          urlSearchParams.set(key, value);
        }
      });

      const newUrl = `${ROUTE_PATH.TRANSACTIONS}?${urlSearchParams.toString()}`;
      router.push(newUrl);

      // 세션 스토리지에 저장
      saveQueryParamsToStorage(newState);
    },
    [getCurrentParams, router, saveQueryParamsToStorage]
  );

  return {
    updateQueryParams,
    getCurrentParams,
    restoreQueryParamsFromStorage,
  };
};
