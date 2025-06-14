import { useEffect, useState } from 'react';

import { TransactionFilter } from '../models/types';

const STORAGE_KEY = 'transaction-filter';

interface Return {
  filter: TransactionFilter;
  setFilter: (value: Partial<TransactionFilter>) => void;
}

export function useTransactionFilter(): Return {
  const [filterState, setFilterState] = useState<TransactionFilter>(() => {
    const storedFilter = sessionStorage.getItem(STORAGE_KEY);
    if (storedFilter) {
      return JSON.parse(storedFilter);
    }
    return {
      apartName: '',
      isNationalSizeOnly: false,
      isFavoriteOnly: false,
    };
  });

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filterState));
  }, [filterState]);

  const setFilter = (nextFilter: Partial<TransactionFilter>) => {
    const changedFilter = { ...filterState, ...nextFilter };
    setFilterState(changedFilter);
  };

  return {
    filter: filterState,
    setFilter: setFilter,
  };
}
