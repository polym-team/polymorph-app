import { logger } from '@/app/api/shared/utils/logger';

import { NextRequest } from 'next/server';

import { parseApartToken } from '../../shared/services/transaction/service';
import { getCachedTransactions, saveCachedTransaction } from './services/cache';
import { createResponse } from './services/crawl';

export async function GET(
  _: NextRequest,
  { params }: { params: { apartToken: string } }
): Promise<Response> {
  if (!params || !params.apartToken) {
    return Response.json(
      { message: '필수 파라미터(apartName, area)가 누락되었습니다.' },
      { status: 400 }
    );
  }

  const apartToken = params.apartToken;
  const parsedApartToken = parseApartToken(apartToken);
  if (!parsedApartToken) {
    return Response.json(
      { message: '필수 파라미터(apartName, area)가 누락되었습니다.' },
      { status: 400 }
    );
  }

  try {
    const cachedData = await getCachedTransactions(params.apartToken);
    if (cachedData) {
      logger.info('캐시 데이터 반환');
      return Response.json(cachedData);
    }

    const result = await createResponse(params.apartToken);
    logger.info('크롤링 완료');

    await saveCachedTransaction(params.apartToken, result);

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
