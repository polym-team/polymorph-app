import { ApartTransactionItem } from '@/entities/apart-transaction';

export interface TransactionItemViewModel extends ApartTransactionItem {
  priceChangeRate: number;
  isNewTransaction: boolean;
  prevTradeItem?: ApartTransactionItem;
}

export type Sorting = [{ id: keyof ApartTransactionItem; desc: boolean }];
