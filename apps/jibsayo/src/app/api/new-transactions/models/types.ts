import { TransactionItem } from '@/app/api/transactions/models/types';

export type ApartmentTransaction = TransactionItem;

export interface ParsedPageResult {
  page: number;
  data: ApartmentTransaction[];
  hasData: boolean;
}

export interface CrawlResult {
  count: number;
  list: ApartmentTransaction[];
  totalPages: number;
  processingTime: number;
}

export interface CachedTransactionData {
  area: string;
  data: CrawlResult;
  crawledAt: Date;
}
