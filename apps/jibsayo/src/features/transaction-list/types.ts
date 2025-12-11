import { TransactionItem } from '@/entities/transaction';

export type TransactionStatus = 'LOADING' | 'NOT_SEARCHED' | 'EMPTY' | 'LOADED';

export interface TransactionItemViewModel extends TransactionItem {
  isNew: boolean;
  isFavorite: boolean;
}

export interface Sorting {
  id: keyof TransactionItem;
  desc: boolean;
}

export interface SummaryState {
  transactionTotalCount: number;
  transactionAverageAmount: number;
}

export interface SortingState {
  state: Sorting;
  update: (sorting: Sorting) => void;
}

export interface PageIndexState {
  state: number;
  update: (pageIndex: number) => void;
}
