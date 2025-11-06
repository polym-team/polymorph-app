import { logger } from '@/app/api/shared/utils/logger';

import { apiRateLimitFirestoreClient } from './fireStoreService';

export const validateUserAgent = (userAgent: string): boolean => {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  return userAgent.includes('Vercel') || userAgent.includes('cron');
};

export async function validateRateLimit(): Promise<boolean> {
  try {
    if (process.env.NODE_ENV === 'development') {
      return true;
    }

    // 한국 시간 기준으로 오늘 날짜 계산 (UTC+9)
    const koreaTime = new Date(Date.now() + 9 * 60 * 60 * 1000);
    const today = koreaTime.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    const rateLimitDocId = `push-api-${today}`;

    // 오늘 날짜의 호출 기록 조회
    const rateLimitDoc =
      await apiRateLimitFirestoreClient.getDocument(rateLimitDocId);

    if (rateLimitDoc) {
      // 이미 오늘 호출된 경우
      return false;
    }

    // 오늘 첫 호출인 경우, 호출 기록 생성
    await apiRateLimitFirestoreClient.createDocumentWithId(rateLimitDocId, {
      lastCalledAt: new Date(),
      createdAt: new Date(),
    });

    return true;
  } catch (error) {
    logger.error('호출 제한 확인 중 에러 발생', { error });
    return false;
  }
}
