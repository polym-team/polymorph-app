import { FavoriteApartItem, TransactionItem } from '@/entities/apart';

export interface FavoriteApartItemViewModel extends FavoriteApartItem {
  isFavorite: boolean;
  hasNewTransaction: boolean;
  latestTransaction: TransactionItem | null;
  newTransaction: TransactionItem | null;
  highestPriceTransaction: TransactionItem | null;
  lowestPriceTransaction: TransactionItem | null;
}

export interface RegionItemViewModel {
  code: string;
  name: string;
  apartItems: FavoriteApartItemViewModel[];
}

export interface RegionTab {
  code: string;
  name: string;
  count: number;
}
