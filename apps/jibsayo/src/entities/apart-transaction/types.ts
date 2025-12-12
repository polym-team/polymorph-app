export interface ApartTransactionItem {
  transactionId: string;
  tradeDate: string;
  size: number;
  floor: number;
  tradeAmount: number;
}

export interface FetchApartTransactionListRequest {
  apartId: number;
}

export interface FetchApartTransactionListResponse {
  items: ApartTransactionItem[];
}
