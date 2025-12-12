export interface ApartTransactionItem {
  id: number;
  dealDate: string;
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
  transactions: ApartTransactionItem[];
}
