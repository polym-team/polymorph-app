export interface ApartmentTransaction {
  apartName: string;
  buildedYear: number | null;
  householdsNumber: number | null;
  address: string;
  tradeDate: string;
  size: number | null;
  floor: number | null;
  isNewRecord: boolean;
  tradeAmount: number;
  maxTradeAmount: number;
}

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
