import { TransactionsResponse } from '@/app/api/transactions/types';
import { FavoriteApartItem } from '@/entities/apart/models/types';

import { TransactionFilter, TransactionItem } from '../models/types';

export const mapTransactionsWithFavorites = ({
  transactions,
  filter,
  favoriteApartList,
  regionCode,
  newTransactionApartIds,
}: {
  transactions: TransactionsResponse['list'];
  filter: TransactionFilter;
  favoriteApartList: FavoriteApartItem[];
  regionCode?: string;
  newTransactionApartIds?: Set<string>;
}): TransactionItem[] => {
  const currentRegionFavorites = favoriteApartList.find(
    region => region.regionCode === regionCode
  );

  return transactions

    .map(transaction => {
      const isFavorite =
        currentRegionFavorites?.apartItems.some(
          apartItem => apartItem.apartId === transaction.apartId
        ) || false;

      return {
        ...transaction,
        favorite: isFavorite,
      };
    })
    .filter(transaction => {
      const isMatched = transaction.apartName
        .toLowerCase()
        .includes(filter.apartName.toLowerCase());
      const isMatchedSize = filter.isNationalSizeOnly
        ? transaction.size >= 84 && transaction.size < 85
        : true;
      const isMatchedFavorite = filter.isFavoriteOnly
        ? transaction.favorite
        : true;
      const isMatchedNewTransaction = filter.isNewTransactionOnly
        ? newTransactionApartIds?.has(transaction.apartId) || false
        : true;

      return (
        isMatched &&
        isMatchedSize &&
        isMatchedFavorite &&
        isMatchedNewTransaction
      );
    });
};
