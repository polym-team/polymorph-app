interface TransactionHistoryItem {
  dealAmount: number;
  dealDate: string;
  size: number;
  floor: number;
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
  orderBy: keyof TransactionItem;
  orderDirection: 'asc' | 'desc';
}

export interface TransactionItem {
  id: number;
  regionCode: string;
  apartName: string;
  dealDate: string;
  dealAmount: number;
  size: number;
  floor: number;
  isNewTransaction: boolean;
  apartId: number | null;
  fallbackToken: string | null;
  buildedYear: number | null;
  householdCount: number | null;
  completionYear: number | null;
  dong: string | null;
  highestTransaction: TransactionHistoryItem | null;
  lowestTransaction: TransactionHistoryItem | null;
}

export interface FetchTransactionListResponse {
  totalCount: number;
  averagePricePerPyeong: number;
  transactions: TransactionItem[];
}
