export interface DbMonthlyTransactionRow {
  month: string;
  size: string;
  count: number;
  averageAmount: number;
}

export interface TransactionSummary {
  sizes: [number, number];
  count: number;
  averageAmount: number;
}

export interface MonthlyTransactionItem {
  month: number;
  transactions: TransactionSummary[];
}

export type MonthlyTransactionsResponse = MonthlyTransactionItem[];
