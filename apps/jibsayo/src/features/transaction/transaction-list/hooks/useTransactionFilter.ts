import { RULES, SearchParams, useSearchParams } from '@/entities/transaction';

import { useEffect, useState } from 'react';

interface TransactionFilter {
  apartName: SearchParams['apartName'];
  minSize: SearchParams['minSize'];
  maxSize: SearchParams['maxSize'];
  favoriteOnly: SearchParams['favoriteOnly'];
  newTransactionOnly: SearchParams['newTransactionOnly'];
}

interface Return {
  filter: TransactionFilter;
  changeFilter: (value: Partial<TransactionFilter>) => void;
  searchFilter: () => void;
}

export const useTransactionFilter = (): Return => {
  const { searchParams, setSearchParams } = useSearchParams();

  const [filter, setFilter] = useState<TransactionFilter>({
    apartName: '',
    minSize: RULES.SEARCH_MIN_SIZE,
    maxSize: RULES.SEARCH_MAX_SIZE,
    favoriteOnly: false,
    newTransactionOnly: false,
  });

  const changeFilter = (nextFilter: Partial<TransactionFilter>) => {
    const changedFilter = { ...filter, ...nextFilter };
    setFilter(changedFilter);
  };

  const searchFilter = () => {
    setSearchParams(filter);
  };

  useEffect(() => {}, [searchParams]);

  return { filter, changeFilter, searchFilter };
};
