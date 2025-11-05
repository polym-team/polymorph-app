import {
  useAddFavoriteApartHandler,
  useFavoriteApartList,
  useRemoveFavoriteApartHandler,
} from '@/entities/apart';
import {
  useTransactionListQuery,
  useTransactionPageSearchParams,
} from '@/entities/transaction';

import { useCallback, useMemo } from 'react';

import { TransactionDetailItem } from '../models/types';
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
  toggleFavorite: (item: TransactionDetailItem) => void;
}

export const useTransactionData = (): Return => {
  const { searchParams } = useTransactionPageSearchParams();
  const favoriteApartList = useFavoriteApartList();
  const addFavoriteApart = useAddFavoriteApartHandler();
  const removeFavoriteApart = useRemoveFavoriteApartHandler();

  const { isLoading, data: transactionData } = useTransactionListQuery();

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
        filterTransactionItemWithNewTransaction(transaction, searchParams)
    );
  }, [transactionData?.list, filteredFavoriteApartList, searchParams]);

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

  const toggleFavorite = useCallback(
    (item: TransactionDetailItem) => {
      const params = {
        apartId: item.apartId,
        apartName: item.apartName,
        address: item.address,
        regionCode: searchParams.regionCode,
      };

      if (item.isFavorite) {
        removeFavoriteApart(params);
      } else {
        addFavoriteApart(params);
      }
    },
    [searchParams.regionCode, addFavoriteApart, removeFavoriteApart]
  );

  return {
    isLoading,
    transactionData: mappedTransactions,
    toggleFavorite,
  };
};
