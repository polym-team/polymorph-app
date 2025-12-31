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
  minDealAmount: number;
  maxDealAmount: number;
  minHouseholdCount: number;
  maxHouseholdCount: number;
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
  apartId: number;
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

export interface RecentTransaction {
  dealDate: string;
  dealAmount: number;
  floor: number;
  size: number;
}

export interface MonthlyTransaction {
  month: number;
  count: number;
  averageAmount: number;
}

export interface ApartTransactionSummary {
  apartId: number;
  apartName: string;
  availableSizes: [number, number][];
  recentTransaction: RecentTransaction | null;
  transactions: MonthlyTransaction[];
}

export interface FetchMonthlyTransactionsByApartsRequest {
  apartIds: number[];
  period?: number;
  sizesByApart?: Record<number, [number, number][]>;
}

export type FetchMonthlyTransactionsByApartsResponse =
  ApartTransactionSummary[];
