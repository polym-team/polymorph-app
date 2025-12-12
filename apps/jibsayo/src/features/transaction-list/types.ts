import { TransactionItem } from '@/entities/transaction';

export interface Sorting {
  id: keyof TransactionItem;
  desc: boolean;
}

export interface SortingState {
  state: Sorting;
  update: (sorting: Sorting) => void;
}

export interface PageIndexState {
  state: number;
  update: (pageIndex: number) => void;
}

export interface TransactionState {
  fetchStatus: 'LOADING' | 'NOT_SEARCHED' | 'EMPTY' | 'LOADED';
  totalCount: number;
  averageAmount: number;
  items: TransactionItemViewModel[];
}

export interface HandlerState {
  toggleFavorite: (item: TransactionItemViewModel) => void;
  navigateToApartDetail: (item: TransactionItemViewModel) => void;
}

export interface TransactionItemViewModel extends TransactionItem {
  isFavorite: boolean;
}
