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
import { calculateTransactionFetchStatus } from '../services/service';
import { TransactionState } from '../types';

export const useTransactionData = (): TransactionState => {
  const { searchParams } = useTransactionPageSearchParams();

  const { data: transactionListData, isFetching: isTransactionListFetching } =
    useTransactionListQuery();
  const { data: favoriteApartListData } = useFavoriteApartListQuery();

  const favoriteApartTokenSet = useMemo(
    () =>
      convertToFavoriteApartTokenSet(searchParams, favoriteApartListData ?? []),
    [favoriteApartListData, searchParams]
  );

  const totalCount = transactionListData?.totalCount ?? 0;
  const averageAmount = transactionListData?.averagePricePerPyeong ?? 0;

  const fetchStatus = calculateTransactionFetchStatus({
    isFetching: isTransactionListFetching,
    isLoadedData: !!transactionListData,
    transactionTotalCount: transactionListData?.totalCount ?? 0,
  });

  const items = useMemo(() => {
    if (!transactionListData?.transactions) return [];

    return convertToTransactionListViewModel(
      transactionListData.transactions,
      favoriteApartTokenSet
    );
  }, [transactionListData?.transactions, favoriteApartTokenSet]);

  return { fetchStatus, totalCount, averageAmount, items };
};
