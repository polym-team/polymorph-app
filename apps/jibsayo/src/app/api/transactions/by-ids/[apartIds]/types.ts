export interface DbMonthlyTransactionByIdsRow {
  apartId: number;
  apartName: string;
  month: string;
  count: number;
  averageAmount: number;
}

export interface TransactionByIdSummary {
  id: number;
  apartName: string;
  averageAmount: number;
}

export interface MonthlyTransactionByIdsItem {
  month: number;
  transactions: TransactionByIdSummary[];
}

export type MonthlyTransactionsByIdsResponse = MonthlyTransactionByIdsItem[];
