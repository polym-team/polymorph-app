import { ApartDetailResponse } from '@/app/api/apart/models/types';
import {
  getCachedApart,
  saveCachedApart,
} from '@/app/api/apart/services/cache';
import { createResponse } from '@/app/api/apart/services/crawl';
import { logger } from '@/app/api/shared/utils/logger';

export async function fetchApartDetail(
  regionCode: string,
  apartName: string
): Promise<ApartDetailResponse | null> {
  try {
    const cachedData = await getCachedApart(apartName, regionCode);

    if (cachedData) {
      return cachedData.data;
    }

    const result = await createResponse(apartName, regionCode);
    await saveCachedApart(apartName, regionCode, result);

    return result;
  } catch (error) {
    logger.error('[fetchApartDetail] 아파트 상세 정보 조회 실패', {
      regionCode,
      apartName,
      error: error instanceof Error ? error.message : String(error),
    });

    return null;
  }
}
