import { ROUTE_PATH } from '@/shared/consts/route';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { TransactionFilter } from '../models/types';

interface Return {
  filter: TransactionFilter;
  setFilter: (value: Partial<TransactionFilter>) => void;
}

export function useTransactionFilter(): Return {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filterState, setFilterState] = useState<TransactionFilter>(() => {
    return {
      apartName: searchParams.get('apartName') ?? '',
      isNationalSizeOnly: searchParams.get('isNationalSizeOnly') === 'true',
      isFavoriteOnly: searchParams.get('isFavoriteOnly') === 'true',
    };
  });

  const updateSearchParams = (nextFilter: TransactionFilter) => {
    const params = new URLSearchParams(searchParams);
    params.set('apartName', nextFilter.apartName);
    params.set('isNationalSizeOnly', nextFilter.isNationalSizeOnly?.toString());
    params.set('isFavoriteOnly', nextFilter.isFavoriteOnly?.toString());
    router.push(`${ROUTE_PATH.TRANSACTIONS}?${params.toString()}`);
  };

  const setFilter = (nextFilter: Partial<TransactionFilter>) => {
    const changedFilter = { ...filterState, ...nextFilter };

    setFilterState(changedFilter);
    updateSearchParams(changedFilter);
  };

  return {
    filter: filterState,
    setFilter: setFilter,
  };
}
