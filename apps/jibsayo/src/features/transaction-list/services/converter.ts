import { FavoriteApartItem } from '@/entities/apart';
import { SearchParams, TransactionItem } from '@/entities/transaction';

import { TransactionItemViewModel } from '../types';

export const convertToFavoriteApartTokenSet = (
  searchParams: SearchParams,
  favoriteApartList: FavoriteApartItem[]
): Set<string> => {
  const filteredFavoriteApartList = favoriteApartList.filter(
    item => item.regionCode === searchParams.regionCode
  );

  return new Set(filteredFavoriteApartList.map(item => item.apartToken));
};

export const convertToTransactionListViewModel = (
  transaction: TransactionItem[],
  favoriteApartTokenSet: Set<string>
): TransactionItemViewModel[] => {
  return transaction.map(item => ({
    ...item,
    isFavorite: !favoriteApartTokenSet, // FIXME
  }));
};
