import { RecentTransaction } from '@/entities/transaction';

export interface CompareApartData {
  id: number;
  apartName: string;
  region: string;
  householdCount: number | null;
  completionYear: number | null;
  recentTransaction: RecentTransaction | null;
}
