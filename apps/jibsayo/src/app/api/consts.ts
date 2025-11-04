// Firestore 컬렉션명 상수
export const COLLECTIONS = {
  // 즐겨찾기 아파트 컬렉션
  FAVORITE_APART: 'favorite-apart',

  // 푸시 토큰 컬렉션
  PUSH_TOKEN: 'push-token',

  // API 호출 제한 컬렉션
  API_RATE_LIMIT: 'api-rate-limit',

  // 신규 실거래 캐시 컬렉션
  NEW_TRANSACTIONS_CACHE: 'new-transactions-cache',
} as const;
