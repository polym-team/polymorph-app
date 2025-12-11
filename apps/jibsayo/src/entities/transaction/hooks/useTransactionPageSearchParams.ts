import { ROUTE_PATH } from '@/shared/consts/route';
import { useNavigate } from '@/shared/hooks/useNavigate';

import { useSearchParams as useNavigationSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import { SEARCH_PARAM_CONFIGS } from '../consts/rule';
import { type SearchParams, TransactionItem } from '../types';

interface Return {
  searchParams: SearchParams;
  setSearchParams: (params: Partial<SearchParams>) => void;
}

const parseSearchParam = (value: string | number | boolean) => {
  if (typeof value === 'boolean' || typeof value === 'number') {
    return value.toString();
  }

  return value;
};

export const useTransactionPageSearchParams = (): Return => {
  const navigationSearchParams = useNavigationSearchParams();
  const { navigate } = useNavigate();

  const regionCode = navigationSearchParams.get('regionCode') ?? '';
  const tradeDate = navigationSearchParams.get('tradeDate') ?? '';
  const pageIndex = navigationSearchParams.get('pageIndex')
    ? Number(navigationSearchParams.get('pageIndex'))
    : 0;
  const apartName = navigationSearchParams.get('apartName') ?? '';
  const minSize = navigationSearchParams.get('minSize')
    ? Number(navigationSearchParams.get('minSize'))
    : SEARCH_PARAM_CONFIGS.SEARCH_MIN_SIZE;
  const maxSize = navigationSearchParams.get('maxSize')
    ? Number(navigationSearchParams.get('maxSize'))
    : Infinity;
  const favoriteOnly = navigationSearchParams.get('favoriteOnly') === 'true';
  const newTransactionOnly =
    navigationSearchParams.get('newTransactionOnly') === 'true';
  const orderBy =
    (navigationSearchParams.get('orderBy') as keyof TransactionItem) ||
    'tradeDate';
  const orderDirection =
    (navigationSearchParams.get('orderDirection') as 'asc' | 'desc') || 'desc';

  const searchParams = useMemo(
    () => ({
      regionCode,
      tradeDate,
      pageIndex,
      apartName,
      minSize,
      maxSize,
      favoriteOnly,
      newTransactionOnly,
      orderBy,
      orderDirection,
    }),
    [
      regionCode,
      tradeDate,
      pageIndex,
      apartName,
      minSize,
      maxSize,
      favoriteOnly,
      newTransactionOnly,
      orderBy,
      orderDirection,
    ]
  );

  const setSearchParams = (params: Partial<SearchParams>) => {
    const newSearchParams = new URLSearchParams(navigationSearchParams);
    Object.entries(params).forEach(([key, value]) => {
      newSearchParams.set(key, parseSearchParam(value));
    });
    navigate(`${ROUTE_PATH.TRANSACTIONS}?${newSearchParams.toString()}`);
  };

  return { searchParams, setSearchParams };
};
