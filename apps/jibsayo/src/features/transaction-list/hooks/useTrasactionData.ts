import { useFavoriteApartList } from '@/entities/apart';
import {
  useNewTransactionListQuery,
  useTransactionListQuery,
  useTransactionPageSearchParams,
} from '@/entities/transaction';

import { useMemo } from 'react';

import { TransactionDetailItem } from '../models/types';
import { calculateNewTransactionIdList } from '../services/calculator';
import {
  filterFavoriteApartListWithRegionCode,
  filterTransactionItemWithApartName,
  filterTransactionItemWithFavorite,
  filterTransactionItemWithNewTransaction,
  filterTransactionItemWithSize,
} from '../services/filter';
import { mapTramsactionItemWithFavorite } from '../services/mapper';

interface Return {
  isLoading: boolean;
  transactionData: TransactionDetailItem[];
}

export const useTransactionData = (): Return => {
  const { searchParams } = useTransactionPageSearchParams();
  const favoriteApartList = useFavoriteApartList();

  const { isLoading, data: transactionData } = useTransactionListQuery();
  const { data: newTransactionData } = useNewTransactionListQuery(
    searchParams.regionCode
  );

  const newTransactionIdList = useMemo(
    () =>
      newTransactionData?.list
        ? calculateNewTransactionIdList(newTransactionData.list)
        : [],
    [newTransactionData?.list]
  );

  const filteredFavoriteApartList = useMemo(() => {
    return filterFavoriteApartListWithRegionCode(
      searchParams,
      favoriteApartList
    );
  }, [favoriteApartList, searchParams]);

  const filteredTransactions = useMemo(() => {
    if (!transactionData?.list) {
      return [];
    }

    return transactionData.list.filter(
      transaction =>
        filterTransactionItemWithApartName(transaction, searchParams) &&
        filterTransactionItemWithSize(transaction, searchParams) &&
        filterTransactionItemWithFavorite(
          transaction,
          filteredFavoriteApartList,
          searchParams
        ) &&
        filterTransactionItemWithNewTransaction(
          transaction,
          newTransactionIdList,
          searchParams
        )
    );
  }, [
    transactionData?.list,
    filteredFavoriteApartList,
    newTransactionIdList,
    searchParams,
  ]);

  const mappedTransactions = useMemo(() => {
    return mapTramsactionItemWithFavorite(
      searchParams.regionCode,
      filteredTransactions,
      filteredFavoriteApartList,
      newTransactionIdList
    );
  }, [
    newTransactionIdList,
    filteredFavoriteApartList,
    filteredTransactions,
    searchParams.regionCode,
  ]);

  return {
    isLoading,
    transactionData: mappedTransactions,
  };
};
