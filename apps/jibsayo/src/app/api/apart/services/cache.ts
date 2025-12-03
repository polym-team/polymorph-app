import { COLLECTIONS } from '@/app/api/shared/consts/firestoreCollection';
import { getFirestoreClient } from '@/app/api/shared/libs/fireStore';
import { logger } from '@/app/api/shared/utils/logger';

import type { ApartDetailResponse, CachedApartData } from '../types';

const firestoreClient = getFirestoreClient(COLLECTIONS.APART_CACHE);

export const CACHE_EXPIRY_MS = 3 * 60 * 60 * 1000;

export function mapFirestoreToCachedData(doc: any): CachedApartData | null {
  if (!doc || !doc.data) return null;

  const crawledAt = doc.data.crawledAt?.toDate();

  if (!crawledAt) return null;

  return {
    apartName: doc.data.apartName,
    area: doc.data.area,
    data: doc.data.data,
    crawledAt,
  };
}

function getCacheKey(apartName: string, area: string): string {
  return `${apartName}:${area}`;
}

export async function getCachedApart(
  apartName: string,
  area: string
): Promise<CachedApartData | null> {
  try {
    const cacheKey = getCacheKey(apartName, area);
    const document = await firestoreClient.getDocument(cacheKey);
    if (!document) return null;

    const cachedData = mapFirestoreToCachedData(document);
    if (!cachedData) return null;

    const now = new Date();
    const calculatedExpiresAt = new Date(
      cachedData.crawledAt.getTime() + CACHE_EXPIRY_MS
    );

    if (now < calculatedExpiresAt) {
      return cachedData;
    }

    await firestoreClient.deleteDocument(cacheKey);
    return null;
  } catch (error) {
    logger.error('캐시 조회 실패:', { error });
    return null;
  }
}

// 캐시 저장 함수
export async function saveCachedApart(
  apartName: string,
  area: string,
  data: ApartDetailResponse
): Promise<boolean> {
  try {
    const now = new Date();
    const cacheKey = getCacheKey(apartName, area);

    const cacheData = {
      apartName,
      area,
      data,
      crawledAt: now,
    };

    // 문서 ID를 cacheKey로 사용하여 저장 (이미 존재하면 업데이트)
    const result = await firestoreClient.createDocumentWithId(
      cacheKey,
      cacheData
    );
    return result.success;
  } catch (error) {
    logger.error('캐시 저장 실패:', { error });
    return false;
  }
}
