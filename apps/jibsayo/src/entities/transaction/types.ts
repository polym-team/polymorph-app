export interface TransactionItem {
  transactionId: string;
  apartToken: string;
  apartId: string;
  apartName: string;
  buildedYear: number | null;
  address: string;
  tradeDate: string;
  size: number;
  floor: number | null;
  tradeAmount: number;
}

export interface SearchParams {
  regionCode: string;
  tradeDate: string;
  pageIndex: number;
  apartName: string;
  minSize: number;
  maxSize: number;
  favoriteOnly: boolean;
  newTransactionOnly: boolean;
}

export interface TransactionListResponse {
  count: number;
  list: TransactionItem[];
}
