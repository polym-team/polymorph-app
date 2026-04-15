export interface RecentTransaction {
  id: number;
  apartId: number | null;
  apartName: string;
  regionCode: string;
  regionName: string;
  dealDate: string;
  dealAmount: number;
  exclusiveArea: number;
  floor: number;
  householdCount: number | null;
  completionYear: number | null;
}

export interface RegionPriceSummary {
  regionCode: string;
  regionName: string;
  avgPrice: number;
  transactionCount: number;
  prevAvgPrice: number | null;
  prevTransactionCount: number;
}

export interface LandingData {
  recentTransactions: RecentTransaction[];
  regionSummaries: RegionPriceSummary[];
}
