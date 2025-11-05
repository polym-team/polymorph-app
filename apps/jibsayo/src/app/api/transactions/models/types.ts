export interface TransactionItem {
  transactionId: string;
  apartId: string;
  apartName: string;
  buildedYear: number | null;
  address: string;
  tradeDate: string;
  size: number | null;
  floor: number | null;
  tradeAmount: number;
}

export interface TransactionsResponse {
  count: number;
  list: TransactionItem[];
}

// 국토부 API 응답 타입
export interface GovApiResponse {
  response?: {
    header?: {
      resultCode?: string;
      resultMsg?: string;
    };
    body?: {
      items?: {
        item?: GovApiItem | GovApiItem[];
      };
      numOfRows?: number;
      pageNo?: number;
      totalCount?: number;
    };
  };
}

export interface GovApiItem {
  aptDong?: string;
  aptNm?: string;
  buildYear?: string;
  buyerGbn?: string;
  cdealDay?: string;
  cdealType?: string;
  dealAmount?: string;
  dealDay?: string;
  dealMonth?: string;
  dealYear?: string;
  dealingGbn?: string;
  estateAgentSggNm?: string;
  excluUseAr?: string;
  floor?: string;
  jibun?: string;
  landLeaseholdGbn?: string;
  rgstDate?: string;
  sggCd?: string;
  slerGbn?: string;
  umdNm?: string;
}
