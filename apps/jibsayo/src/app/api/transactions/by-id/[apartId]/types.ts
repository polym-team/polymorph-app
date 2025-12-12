export type OrderBy = 'dealDate' | 'dealAmount';
export type OrderDirection = 'asc' | 'desc';

export interface DbTransactionRow {
  id: number;
  dealDate: string;
  size: string;
  floor: number;
  dealAmount: number;
  isNewTransaction: boolean;
  prevTransaction: string | null;
}

export interface TransactionItem {
  id: number;
  dealDate: string;
  size: number;
  floor: number;
  dealAmount: number;
  changeRate: number;
  isNewTransaction: boolean;
  prevTransaction: Omit<
    TransactionItem,
    'id' | 'prevTransaction' | 'changeRate' | 'isNewTransaction'
  > | null;
}

export interface TransactionsByTokenResponse {
  totalCount: number;
  transactions: TransactionItem[];
}
