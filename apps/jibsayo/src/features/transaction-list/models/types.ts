import { TransactionItem } from '@/entities/transaction';

export interface TransactionDetailItem extends TransactionItem {
  isNew: boolean;
  isFavorite: boolean;
}

export interface Sorting {
  id: 'tradeDate' | 'tradeAmount';
  desc: boolean;
}
