export interface DbTransactionRow {
  regionCode: string;
  apartName: string;
  dealDate: string;
  dealAmount: number;
  size: number;
  floor: number;
  isNewTransaction: boolean;
  apartId: number | null;
  buildedYear: number | null;
  householdCount: number | null;
  jibun: string | null;
  dong: string | null;
  fallbackToken: string | null;
}

export interface FetchTransactionListParams {
  regionCode: string;
  dealPeriod: string;
  pageIndex: number;
  pageSize: number;
  filter: {
    apartName?: string;
    minSize?: number;
    maxSize?: number;
    newTransactionOnly?: boolean;
  };
  sort: {
    orderBy?: 'dealDate' | 'dealAmount';
    orderDirection?: 'asc' | 'desc';
  };
}

export interface FetchTransactionListResponse {
  totalCount: number;
  transactions: DbTransactionRow[];
  averagePricePerPyeong: number;
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
