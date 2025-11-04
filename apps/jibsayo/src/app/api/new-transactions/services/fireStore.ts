import { firestoreClient } from '@/app/api/shared/libs/fireStore';

import type { CachedTransactionData, CrawlResult } from '../models/types';

// 캐시 유효 시간 (3시간 = 3 * 60 * 60 * 1000ms)
export const CACHE_EXPIRY_MS = 3 * 60 * 60 * 1000;

// Firestore 데이터를 CachedTransactionData 타입으로 변환
export function mapFirestoreToCachedData(
  doc: any
): CachedTransactionData | null {
  if (!doc || !doc.data) return null;

  const crawledAt = doc.data.crawledAt?.toDate();

  if (!crawledAt) return null;

  return {
    area: doc.data.area,
    data: doc.data.data,
    crawledAt,
  };
}

// 캐시 조회 함수
export async function getCachedTransactions(
  area: string
): Promise<CachedTransactionData | null> {
  try {
    const document = await firestoreClient.getDocument(area);
    if (!document) return null;

    const cachedData = mapFirestoreToCachedData(document);
    if (!cachedData) return null;

    // 만료 시간 확인 (crawledAt 기준으로 재계산하여 확인)
    const now = new Date();
    const calculatedExpiresAt = new Date(
      cachedData.crawledAt.getTime() + CACHE_EXPIRY_MS
    );

    if (now < calculatedExpiresAt) {
      return cachedData;
    }

    // 만료된 캐시는 삭제
    await firestoreClient.deleteDocument(area);
    return null;
  } catch (error) {
    console.error('캐시 조회 실패:', error);
    return null;
  }
}

// 캐시 저장 함수
export async function saveCachedTransactions(
  area: string,
  data: CrawlResult
): Promise<boolean> {
  try {
    const now = new Date();

    const cacheData = {
      area,
      data,
      crawledAt: now,
    };

    // 문서 ID를 area로 사용하여 저장 (이미 존재하면 업데이트)
    const result = await firestoreClient.createDocumentWithId(area, cacheData);
    return result.success;
  } catch (error) {
    console.error('캐시 저장 실패:', error);
    return false;
  }
}
