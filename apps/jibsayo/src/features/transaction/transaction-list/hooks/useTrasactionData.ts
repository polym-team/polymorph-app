import {
  TransactionItem,
  useSearchParams,
  useTransactionListQuery,
} from '@/entities/transaction';

import { useMemo } from 'react';

import { filterTransactionListWithFilter } from '../services/filter';

interface Return {
  isLoading: boolean;
  transactionData: TransactionItem[];
}

export const useTransactionData = (): Return => {
  const { isLoading, data } = useTransactionListQuery();
  const { searchParams } = useSearchParams();

  const filteredTransactions = useMemo(() => {
    if (!data?.list) {
      return [];
    }

    return filterTransactionListWithFilter(data.list, searchParams);
  }, [data?.list, searchParams]);

  return { isLoading, transactionData: filteredTransactions };
};
