import { FavoriteApartItem, TransactionItem } from '@/entities/apart';

export interface FavoriteApartItemViewModel extends FavoriteApartItem {
  isFavorite: boolean;
  hasNewTransaction: boolean;
  latestTransaction: TransactionItem | null;
  highestPriceTransaction: TransactionItem | null;
  lowestPriceTransaction: TransactionItem | null;
}

export interface RegionItemViewModel {
  code: string;
  name: string;
  apartItems: FavoriteApartItemViewModel[];
}
