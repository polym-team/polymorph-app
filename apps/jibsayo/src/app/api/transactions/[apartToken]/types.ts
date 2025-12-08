export interface TransactionItem {
  transactionId: string;
  tradeDate: string;
  size: number;
  floor: number;
  tradeAmount: number;
}

export interface TransactionsByTokenResponse {
  items: TransactionItem[];
}

export interface CachedTransactionsByTokenData {
  data: TransactionsByTokenResponse;
  crawledAt: Date;
}
