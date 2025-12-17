export interface TransactionItem {
  id: number;
  dealDate: string;
  size: number;
  floor: number;
  dealAmount: number;
}

export interface ApartmentTransactionSummary {
  apartId: number;
  latestTransaction: TransactionItem | null;
  highestPriceTransaction: TransactionItem | null;
  lowestPriceTransaction: TransactionItem | null;
  hasNewTransaction: boolean;
}

export interface TransactionsByFavoritesResponse {
  results: ApartmentTransactionSummary[];
}
