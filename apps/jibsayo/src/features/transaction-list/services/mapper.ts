import { TransactionsResponse } from '@/app/api/transactions/types';
import { FavoriteApartItem } from '@/entities/apart/models/types';

import { TransactionFilter, TransactionItem } from '../models/types';

export const mapTransactionsWithFavorites = ({
  transactions,
  filter,
  favoriteApartList,
  regionCode,
  newTransactionKeys,
}: {
  transactions: TransactionsResponse['list'];
  filter: TransactionFilter;
  favoriteApartList: FavoriteApartItem[];
  regionCode?: string;
  newTransactionKeys?: Set<string>;
}): TransactionItem[] => {
  const currentRegionFavorites = favoriteApartList.find(
    region => region.regionCode === regionCode
  );

  return transactions

    .map(transaction => {
      const isFavorite =
        currentRegionFavorites?.apartItems.some(
          apartItem =>
            apartItem.apartName === transaction.apartName &&
            apartItem.address === transaction.address
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
        ? newTransactionKeys?.has(transaction.apartId) || false
        : true;

      return (
        isMatched &&
        isMatchedSize &&
        isMatchedFavorite &&
        isMatchedNewTransaction
      );
    });
};
