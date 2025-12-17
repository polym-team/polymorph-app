export interface ApartTransactionItem {
  id: number;
  dealDate: string;
  cancellationDate: string | null;
  size: number;
  floor: number;
  dealAmount: number;
  changeRate: number;
  isNewTransaction: boolean;
  prevTransaction: Omit<
    ApartTransactionItem,
    'prevTransaction' | 'changeRate'
  > | null;
}

export interface PageIndexByYear {
  year: number;
  index: number;
  count: number;
}

export interface FetchApartTransactionListRequest {
  apartId: number;
  pageIndex: number;
  pageSize: number;
  sizes?: [number, number][];
  period?: number;
  orderBy?: keyof ApartTransactionItem;
  orderDirection?: 'asc' | 'desc';
}

export interface FetchApartTransactionListResponse {
  totalCount: number;
  pageIndexes: PageIndexByYear[];
  transactions: ApartTransactionItem[];
}

export interface MonthlyTransactionItem {
  month: number;
  transactions: {
    sizes: [number, number];
    count: number;
    averageAmount: number;
  }[];
}

export interface FetchMonthlyTransactionRequest {
  apartId: number;
  period?: number;
  sizes?: [number, number][];
}

export type FetchMonthlyTransactionResponse = MonthlyTransactionItem[];
