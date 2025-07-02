import { useSearchParams } from '@/entities/transaction';
import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { getItem, setItem } from '@/shared/lib/sessionStorage';

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

export const useTransactionFilter = (): Return => {
  const { searchParams } = useSearchParams();

  const [filterState, setFilterState] =
    useState<TransactionFilter>(initialState);

  const prevSearchParams = useRef<string | undefined>(
    `${searchParams.regionCode}-${searchParams.tradeDate}`
  );

  const setFilter = (nextFilter: Partial<TransactionFilter>) => {
    const changedFilter = { ...filterState, ...nextFilter };
    setFilterState(changedFilter);
    setItem(STORAGE_KEY.TRANSACTION_LIST_FILTER, changedFilter);
  };

  useEffect(() => {
    const storedFilter = getItem<TransactionFilter>(
      STORAGE_KEY.TRANSACTION_LIST_FILTER
    );

    if (storedFilter) {
      setFilterState(storedFilter);
    }
  }, []);

  useEffect(() => {
    const currentSearchParams = `${searchParams.regionCode}-${searchParams.tradeDate}`;

    if (!prevSearchParams.current) {
      prevSearchParams.current = currentSearchParams;
      return;
    }

    if (prevSearchParams.current !== currentSearchParams) {
      // 지역이나 날짜가 변경되면 필터 초기화
      setFilterState(initialState);
      setItem(STORAGE_KEY.TRANSACTION_LIST_FILTER, initialState);
    }

    prevSearchParams.current = currentSearchParams;
  }, [searchParams.regionCode, searchParams.tradeDate]);

  return {
    filter: filterState,
    setFilter: setFilter,
  };
};
