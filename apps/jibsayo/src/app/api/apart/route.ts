import { logger } from '@/app/api/shared/utils/logger';

import { getCachedApart, saveCachedApart } from './services/cache';
import { createResponse } from './services/crawl';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const apartName = searchParams.get('apartName');
  const area = searchParams.get('area');

  if (!apartName || !area) {
    return Response.json(
      { message: '필수 파라미터(apartName, area)가 누락되었습니다.' },
      { status: 400 }
    );
  }

  try {
    const cachedData = await getCachedApart(apartName, area);
    if (cachedData) {
      logger.info('캐시 데이터 반환');
      return Response.json(cachedData.data);
    }

    const result = await createResponse(apartName, area);
    logger.info('크롤링 완료');

    await saveCachedApart(apartName, area, result);

    return Response.json(result);
  } catch (error) {
    return Response.json(
      {
        message: '서버 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}
