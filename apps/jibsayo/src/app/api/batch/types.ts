/**
 * 배치 작업 관련 타입 정의
 */

/**
 * 거래 ID 스냅샷 (매일 저장)
 * Document ID: "{YYYYMMDD}_{regionCode}" (예: "20251119_11740")
 *
 * 지역별 모든 거래 ID를 배열에 저장 (현재 + 지난달)
 */
export interface TransactionArchive {
  /** 지역코드 (5자리) */
  regionCode: string;

  /** 날짜 (YYYY-MM-DD) */
  date: string;

  /** 모든 거래 ID 배열 (중복 제거됨) */
  transactionIds: string[];

  /** 스냅샷 저장 시각 */
  savedAt: Date;
}
