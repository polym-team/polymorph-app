export interface ApartDetailTradeHistoryItem {
  tradeDate: string;
  size: number;
  floor: number;
  tradeAmount: number;
}

export interface ApartDetailResponse {
  regionCode: string;
  apartName: string;
  address: string;
  housholdsCount: string;
  parking: string;
  floorAreaRatio: number;
  buildingCoverageRatio: number;
  tradeItems: ApartDetailTradeHistoryItem[];
}
