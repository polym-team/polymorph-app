interface TransactionItem {
  id: string;
  apartName: string;
  buildedYear: number | null;
  householdsNumber: number | null;
  address: string;
  tradeDate: string;
  size: number;
  floor: number | null;
  isNewRecord: boolean;
  tradeAmount: number;
  maxTradeAmount: number;
}

export interface TransactionsResponse {
  count: number;
  list: TransactionItem[];
}
