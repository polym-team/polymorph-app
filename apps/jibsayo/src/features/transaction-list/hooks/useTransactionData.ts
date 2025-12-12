import { useFavoriteApartListQuery } from '@/entities/apart';
import {
  useTransactionListQuery,
  useTransactionPageSearchParams,
} from '@/entities/transaction';

import { useMemo } from 'react';

import {
  convertToFavoriteApartTokenSet,
  convertToTransactionListViewModel,
} from '../services/converter';
import { TransactionItemViewModel } from '../types';

interface Return {
  transactions: TransactionItemViewModel[];
}

export const useTransactionData = (): Return => {
  const { searchParams } = useTransactionPageSearchParams();

  const { data: transactionListData } = useTransactionListQuery();
  const { data: favoriteApartListData } = useFavoriteApartListQuery();

  const favoriteApartTokenSet = useMemo(
    () =>
      convertToFavoriteApartTokenSet(searchParams, favoriteApartListData ?? []),
    [favoriteApartListData, searchParams]
  );

  const transactions = useMemo(() => {
    if (!transactionListData?.transactions) return [];

    return convertToTransactionListViewModel(
      transactionListData.transactions,
      favoriteApartTokenSet
    );
  }, [transactionListData?.transactions, favoriteApartTokenSet]);

  return { transactions };
};
