export interface ApartTransactionItem {
  transactionId: string;
  tradeDate: string;
  size: number;
  floor: number;
  tradeAmount: number;
}

export interface FetchApartTransactionListRequest {
  apartToken: string;
}

export interface FetchApartTransactionListResponse {
  items: ApartTransactionItem[];
}
