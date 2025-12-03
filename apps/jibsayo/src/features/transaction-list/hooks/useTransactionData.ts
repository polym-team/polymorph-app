import { useFavoriteApartListQuery } from '@/entities/apart';
import {
  TransactionItem,
  useNewTransactionListQuery,
  useTransactionListQuery,
  useTransactionPageSearchParams,
} from '@/entities/transaction';

import { useMemo } from 'react';

import {
  convertToFavoriteApartTokenSet,
  convertToNewTransactionIdSet,
  convertToTransactionListViewModel,
  filterTransactionItemWithApartName,
  filterTransactionItemWithFavorite,
  filterTransactionItemWithNewTransaction,
  filterTransactionItemWithSize,
  sliceTransactionList,
  sortTransactionList,
} from '../services/converter';
import { calculateTransactionAverageAmount } from '../services/service';
import { Sorting, TransactionItemViewModel } from '../types';

interface Params {
  pageIndex: number;
  sorting: Sorting;
}

interface Return {
  transactionTotalCount: number;
  transactionAverageAmount: number;
  filteredTransactions: TransactionItem[];
  convertedTransactions: TransactionItemViewModel[];
}

export const useTransactionData = ({ pageIndex, sorting }: Params): Return => {
  const { searchParams } = useTransactionPageSearchParams();

  const { data: transactionListData } = useTransactionListQuery();
  const { data: favoriteApartListData } = useFavoriteApartListQuery();
  const { data: newTransactionData } = useNewTransactionListQuery(
    searchParams.regionCode
  );

  const newTransactionIdSet = useMemo(
    () =>
      convertToNewTransactionIdSet(newTransactionData?.transactionIds ?? []),
    [newTransactionData]
  );
  const favoriteApartTokenSet = useMemo(
    () =>
      convertToFavoriteApartTokenSet(searchParams, favoriteApartListData ?? []),
    [favoriteApartListData, searchParams]
  );

  const filteredTransactions = useMemo(() => {
    if (!transactionListData) return [];

    return transactionListData.list.filter(
      transaction =>
        filterTransactionItemWithApartName(transaction, searchParams) &&
        filterTransactionItemWithSize(transaction, searchParams) &&
        filterTransactionItemWithFavorite(
          transaction,
          searchParams,
          favoriteApartTokenSet
        ) &&
        filterTransactionItemWithNewTransaction(
          transaction,
          searchParams,
          newTransactionIdSet
        )
    );
  }, [
    transactionListData,
    newTransactionIdSet,
    searchParams,
    favoriteApartTokenSet,
  ]);

  const sortedTransactions = useMemo(() => {
    return sortTransactionList(filteredTransactions, sorting);
  }, [filteredTransactions, sorting]);

  const slicedTransactions = useMemo(() => {
    return sliceTransactionList(sortedTransactions, pageIndex);
  }, [sortedTransactions, pageIndex]);

  const convertedTransactions = useMemo(() => {
    return convertToTransactionListViewModel(
      slicedTransactions,
      newTransactionIdSet,
      favoriteApartTokenSet
    );
  }, [favoriteApartTokenSet, slicedTransactions, newTransactionIdSet]);

  const transactionTotalCount = filteredTransactions.length;
  const transactionAverageAmount =
    calculateTransactionAverageAmount(filteredTransactions);

  return {
    transactionTotalCount,
    transactionAverageAmount,
    filteredTransactions,
    convertedTransactions,
  };
};
