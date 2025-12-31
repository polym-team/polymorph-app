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

export type MonthlyTransactionsByIdsResponse = ApartTransactionSummary[];
