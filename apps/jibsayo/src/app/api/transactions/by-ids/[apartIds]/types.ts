export interface DbMonthlyTransactionByIdsRow {
  apartId: number;
  apartName: string;
  month: string;
  count: number;
  averageAmount: number;
  latestDealDate: string | null;
  latestDealAmount: number | null;
  latestFloor: number | null;
  latestSize: number | null;
}

export interface TransactionByIdSummary {
  id: number;
  apartName: string;
  averageAmount: number;
  latestDealDate: string | null;
  latestDealAmount: number | null;
  latestFloor: number | null;
  latestSize: number | null;
}

export interface MonthlyTransactionByIdsItem {
  month: number;
  transactions: TransactionByIdSummary[];
}

export type MonthlyTransactionsByIdsResponse = MonthlyTransactionByIdsItem[];
