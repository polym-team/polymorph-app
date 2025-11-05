export interface ApartDetailTradeHistoryItem {
  transactionId: string;
  tradeDate: string;
  size: number;
  floor: number;
  tradeAmount: number;
}

export interface ApartDetailResponse {
  regionCode: string;
  apartId: string;
  apartName: string;
  address: string;
  housholdsCount: string;
  parking: string;
  floorAreaRatio: number;
  buildingCoverageRatio: number;
  tradeItems: ApartDetailTradeHistoryItem[];
}

export interface CachedApartData {
  apartName: string;
  area: string;
  data: ApartDetailResponse;
  crawledAt: Date;
}
