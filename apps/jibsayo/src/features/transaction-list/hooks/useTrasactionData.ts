import { useFavoriteApartList } from '@/entities/apart';
import {
  useSearchParams,
  useTransactionListQuery,
} from '@/entities/transaction';

import { useMemo } from 'react';

import { TransactionItemWithFavorite } from '../models/types';
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
  transactionData: TransactionItemWithFavorite[];
}

export const useTransactionData = (): Return => {
  const favoriteApartList = useFavoriteApartList();

  const { isLoading, data } = useTransactionListQuery();
  const { searchParams } = useSearchParams();

  const filteredFavoriteApartList = useMemo(() => {
    return filterFavoriteApartListWithRegionCode(
      searchParams.regionCode,
      favoriteApartList
    );
  }, [favoriteApartList, searchParams.regionCode]);

  const filteredTransactions = useMemo(() => {
    if (!data?.list) {
      return [];
    }

    return data.list.filter(
      transaction =>
        filterTransactionItemWithApartName(
          transaction,
          searchParams.apartName
        ) &&
        filterTransactionItemWithSize(
          transaction,
          searchParams.minSize,
          searchParams.maxSize
        ) &&
        filterTransactionItemWithFavorite(
          transaction,
          filteredFavoriteApartList,
          searchParams.favoriteOnly
        ) &&
        filterTransactionItemWithNewTransaction(
          transaction,
          searchParams.newTransactionOnly
        )
    );
  }, [data?.list, filteredFavoriteApartList, searchParams]);

  const mappedTransactions = useMemo(() => {
    return mapTramsactionItemWithFavorite(
      searchParams.regionCode,
      filteredTransactions,
      filteredFavoriteApartList
    );
  }, [
    filteredFavoriteApartList,
    filteredTransactions,
    searchParams.regionCode,
  ]);

  return {
    isLoading,
    transactionData: mappedTransactions,
  };
};
