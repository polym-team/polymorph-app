import { COLLECTIONS } from '@/app/api/shared/consts/firestoreCollection';
import { getFirestoreClient } from '@/app/api/shared/libs/fireStore';
import { logger } from '@/app/api/shared/utils/logger';

import type {
  CachedTransactionsByTokenData,
  TransactionsByTokenResponse,
} from '../types';

const firestoreClient = getFirestoreClient(COLLECTIONS.APART_CACHE);

export const CACHE_EXPIRY_MS = 3 * 60 * 60 * 1000;

export function mapFirestoreToCachedData(
  doc: any
): CachedTransactionsByTokenData | null {
  if (!doc || !doc.data) return null;

  const crawledAt = doc.data.crawledAt?.toDate();
  if (!crawledAt) return null;

  return {
    data: doc.data.data,
    crawledAt,
  };
}

export async function getCachedTransactions(
  apartToken: string
): Promise<TransactionsByTokenResponse | null> {
  try {
    const cacheKey = apartToken;
    const document = await firestoreClient.getDocument(cacheKey);
    if (!document) return null;

    const cachedData = mapFirestoreToCachedData(document);
    if (!cachedData) return null;

    const now = new Date();
    const calculatedExpiresAt = new Date(
      cachedData.crawledAt.getTime() + CACHE_EXPIRY_MS
    );

    if (now < calculatedExpiresAt) {
      return cachedData.data;
    }

    await firestoreClient.deleteDocument(cacheKey);
    return null;
  } catch (error) {
    logger.error('캐시 조회 실패:', { error });
    return null;
  }
}

// 캐시 저장 함수
export async function saveCachedTransaction(
  apartToken: string,
  data: TransactionsByTokenResponse
): Promise<boolean> {
  try {
    const now = new Date();
    const cacheKey = apartToken;

    const cacheData = {
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
