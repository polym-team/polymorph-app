import { FavoriteApartItem } from '@/entities/apart';
import { SearchParams, TransactionItem } from '@/entities/transaction';

import { TransactionItemViewModel } from '../types';

export const convertToFavoriteApartTokenSet = (
  searchParams: SearchParams,
  favoriteApartList: FavoriteApartItem[]
): Set<number> => {
  const filteredFavoriteApartList = favoriteApartList.filter(
    item => item.regionCode === searchParams.regionCode
  );

  return new Set(filteredFavoriteApartList.map(item => item.apartId));
};

export const convertToTransactionListViewModel = (
  transaction: TransactionItem[],
  favoriteApartTokenSet: Set<number>
): TransactionItemViewModel[] => {
  return transaction.map(item => ({
    ...item,
    isFavorite: item.apartId ? favoriteApartTokenSet.has(item.apartId) : false,
  }));
};
