interface TransactionItem {
  apartName: string;
  buildedYear: number;
  householdsNumber: number;
  address: string;
  tradeDate: string;
  size: number;
  floor: number;
  isNewRecord: boolean;
  tradeAmount: number;
  maxTradeAmount: number;
}

export interface TransactionsResponse {
  count: number;
  list: TransactionItem[];
}
