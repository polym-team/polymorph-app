import { ApartDetailResponse } from '@/app/api/apart/models/types';
import { getCachedApart, saveCachedApart } from '@/app/api/apart/services/cache';
import { createResponse } from '@/app/api/apart/services/crawl';
import { logger } from '@/app/api/shared/utils/logger';

export async function fetchApartDetail(
  regionCode: string,
  apartName: string
): Promise<ApartDetailResponse | null> {
  try {
    logger.info('[fetchApartDetail] 아파트 상세 정보 조회 시작', {
      regionCode,
      apartName,
    });

    // 캐시 확인
    const cachedData = await getCachedApart(apartName, regionCode);
    if (cachedData) {
      logger.info('[fetchApartDetail] 캐시 데이터 반환', {
        apartName,
        regionCode,
      });
      return cachedData.data;
    }

    // 캐시가 없으면 크롤링 수행
    logger.info('[fetchApartDetail] 크롤링 시작', {
      apartName,
      regionCode,
    });
    const result = await createResponse(apartName, regionCode);

    // 결과를 캐시에 저장
    await saveCachedApart(apartName, regionCode, result);

    logger.info('[fetchApartDetail] 크롤링 완료 및 캐시 저장', {
      apartName,
      regionCode,
    });

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
