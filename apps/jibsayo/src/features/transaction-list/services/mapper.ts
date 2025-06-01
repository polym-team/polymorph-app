import { TransactionsResponse } from '@/app/api/transactions/types';
import { FavoriteApartItem } from '@/entities/apart/models/types';

import { TransactionItem } from '../models/types';

export const mapTransactionsWithFavorites = ({
  transactions,
  searchTerm,
  isNationalSizeOnly,
  isFavoriteOnly,
  favoriteApartList,
  regionCode,
}: {
  transactions: TransactionsResponse['list'];
  searchTerm: string;
  isNationalSizeOnly: boolean;
  isFavoriteOnly: boolean;
  favoriteApartList: FavoriteApartItem[];
  regionCode?: string;
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
        .includes(searchTerm.toLowerCase());
      const isMatchedSize = isNationalSizeOnly
        ? transaction.size >= 84 && transaction.size < 85
        : true;
      const isMatchedFavorite = isFavoriteOnly ? transaction.favorite : true;

      return isMatched && isMatchedSize && isMatchedFavorite;
    });
};
