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

  const prevRegionCode = useRef<string | undefined>(searchParams.regionCode);

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
    if (!prevRegionCode.current) return;

    if (prevRegionCode.current !== searchParams.regionCode) {
      setFilter({ apartName: '' });
    }

    prevRegionCode.current = searchParams.regionCode;
  }, [searchParams.regionCode]);

  return {
    filter: filterState,
    setFilter: setFilter,
  };
};
