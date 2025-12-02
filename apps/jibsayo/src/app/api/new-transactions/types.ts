export interface TransactionArchive {
  /** 지역코드 (5자리) */
  regionCode: string;

  /** 날짜 (YYYY-MM-DD) */
  date: string;

  /** 모든 거래 ID 배열 (중복 가능) */
  transactionIds: string[];

  /** 스냅샷 저장 시각 */
  savedAt: Date;
}

export interface NewTransactionsResponse {
  count: number;
  transactionIds: string[];
}
