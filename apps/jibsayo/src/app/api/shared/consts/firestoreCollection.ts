// Firestore 컬렉션명 상수
export const COLLECTIONS = {
  // 아파트 정보 컬렉션
  APARTMENTS: 'apartments',

  // 즐겨찾기 아파트 컬렉션
  FAVORITE_APART: 'favorite-apart',

  // 푸시 토큰 컬렉션
  PUSH_TOKEN: 'push-token',

  // 아파트 상세 정보 캐시 컬렉션
  APART_CACHE: 'legacy-apart-cache',

  // 매일 거래 스냅샷 저장 (날짜별 지역별 거래 ID)
  LEGACY_TRANSACTIONS: 'legacy-transactions',
} as const;
