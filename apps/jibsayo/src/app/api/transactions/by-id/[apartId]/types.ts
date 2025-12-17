export type OrderBy = 'dealDate' | 'dealAmount';
export type OrderDirection = 'asc' | 'desc';
export type PageIndexes = { year: number; index: number; count: number }[];

export interface DbTransactionRow {
  id: number;
  dealDate: string;
  cancellationDate: string | null;
  size: string;
  floor: number;
  dealAmount: number;
  isNewTransaction: boolean;
  prevTransaction: string | null;
}

export interface TransactionItem {
  id: number;
  dealDate: string;
  cancellationDate: string | null;
  size: number;
  floor: number;
  dealAmount: number;
  changeRate: number;
  isNewTransaction: boolean;
  prevTransaction: Omit<
    TransactionItem,
    | 'id'
    | 'prevTransaction'
    | 'changeRate'
    | 'isNewTransaction'
    | 'cancellationDate'
  > | null;
}

export interface TransactionsByIdResponse {
  totalCount: number;
  pageIndexes: PageIndexes;
  transactions: TransactionItem[];
}
