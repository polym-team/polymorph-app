import { useFavoriteApartList } from '@/entities/apart';
import {
  useSearchParams,
  useTransactionListQuery,
} from '@/entities/transaction';

import { useMemo } from 'react';

import { TransactionItemWithFavorite } from '../models/types';
import {
  filterFavoriteApartListWithRegionCode,
  filterTransactionListWithFilter,
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

  const mappedTransactions = useMemo(() => {
    if (!data?.list) {
      return [];
    }

    const filteredFavoriteApartList = filterFavoriteApartListWithRegionCode(
      searchParams.regionCode,
      favoriteApartList
    );

    const filteredTransactions = filterTransactionListWithFilter(
      data.list,
      searchParams
    );

    return mapTramsactionItemWithFavorite(
      searchParams.regionCode,
      filteredTransactions,
      filteredFavoriteApartList
    );
  }, [data?.list, favoriteApartList, searchParams]);

  return {
    isLoading,
    transactionData: mappedTransactions,
  };
};
