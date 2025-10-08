import { FavoriteApartItem } from '@/entities/apart/models/types';
import { TransactionItem } from '@/entities/transaction';
import { isSameApartItem } from '@/shared/services/helper';

export const mapTramsactionItemWithFavorite = (
  regionCode: string,
  transaction: TransactionItem[],
  favoriteApartList: FavoriteApartItem[]
) => {
  return transaction.map(item => ({
    ...item,
    isFavorite: favoriteApartList.some(favoriteApart =>
      isSameApartItem({ ...item, regionCode }, favoriteApart)
    ),
  }));
};
