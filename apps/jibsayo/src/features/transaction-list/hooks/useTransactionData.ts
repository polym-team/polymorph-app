import { useFavoriteApartList } from '@/entities/apart';
import {
  TransactionItem,
  useNewTransactionListQuery,
  useTransactionPageSearchParams,
} from '@/entities/transaction';

import { useMemo } from 'react';

import { Sorting, TransactionDetailItem } from '../models/types';
import { calculateTransactionAverageAmount } from '../services/calculator';
import {
  filterFavoriteApartListWithRegionCode,
  filterTransactionItemWithApartName,
  filterTransactionItemWithFavorite,
  filterTransactionItemWithNewTransaction,
  filterTransactionItemWithSize,
  sliceTransactionList,
  sortTransactionList,
} from '../services/filter';
import { mapTramsactionItemWithFavorite } from '../services/mapper';

interface Params {
  transactionListData: TransactionItem[];
  pageIndex: number;
  sorting: Sorting;
}

interface Return {
  transactionData: TransactionDetailItem[];
  transactionTotalCount: number;
  transactionAverageAmount: number;
}

export const useTransactionData = ({
  transactionListData,
  pageIndex,
  sorting,
}: Params): Return => {
  const { searchParams } = useTransactionPageSearchParams();
  const favoriteApartList = useFavoriteApartList();

  const { data: newTransactionData } = useNewTransactionListQuery(
    searchParams.regionCode
  );

  const newTransactionIds = useMemo(
    () => newTransactionData?.transactionIds || [],
    [newTransactionData]
  );

  const filteredFavoriteApartList = useMemo(() => {
    return filterFavoriteApartListWithRegionCode(
      searchParams,
      favoriteApartList
    );
  }, [favoriteApartList, searchParams]);

  const filteredTransactions = useMemo(() => {
    return transactionListData.filter(
      transaction =>
        filterTransactionItemWithApartName(transaction, searchParams) &&
        filterTransactionItemWithSize(transaction, searchParams) &&
        filterTransactionItemWithFavorite(
          transaction,
          searchParams,
          filteredFavoriteApartList
        ) &&
        filterTransactionItemWithNewTransaction(
          transaction,
          searchParams,
          newTransactionIds
        )
    );
  }, [
    transactionListData,
    newTransactionIds,
    searchParams,
    filteredFavoriteApartList,
  ]);

  const sortedTransactions = useMemo(() => {
    return sortTransactionList(filteredTransactions, sorting);
  }, [filteredTransactions, sorting]);

  const slicedTransactions = useMemo(() => {
    return sliceTransactionList(sortedTransactions, pageIndex);
  }, [sortedTransactions, pageIndex]);

  const mappedTransactions = useMemo(() => {
    return mapTramsactionItemWithFavorite(
      slicedTransactions,
      newTransactionIds,
      filteredFavoriteApartList
    );
  }, [filteredFavoriteApartList, slicedTransactions, newTransactionIds]);

  const transactionTotalCount = filteredTransactions.length;
  const transactionAverageAmount =
    calculateTransactionAverageAmount(filteredTransactions);

  return {
    transactionData: mappedTransactions,
    transactionTotalCount,
    transactionAverageAmount,
  };
};
