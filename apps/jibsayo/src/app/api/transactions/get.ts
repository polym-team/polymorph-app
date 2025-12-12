import { logger } from '@/app/api/shared/utils/logger';

import { fetchTransactionList } from './services/api';

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get('area'); // 지역 코드 (예: 11740)
    const createDt = searchParams.get('createDt'); // 거래년월 (예: 202510)
    const pageIndex = searchParams.get('pageIndex'); // 페이지 인덱스
    const pageSize = searchParams.get('pageSize'); // 페이지 크기

    if (!area || !createDt || !pageIndex || !pageSize) {
      return Response.json(
        { message: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const result = await fetchTransactionList({
      regionCode: area,
      dealPeriod: createDt,
      pageIndex: parseInt(pageIndex, 10),
      pageSize: parseInt(pageSize, 10),
      filter: {
        apartName: searchParams.get('apartName') || undefined,
        minSize: searchParams.get('minSize')
          ? parseFloat(searchParams.get('minSize') as string)
          : undefined,
        maxSize: searchParams.get('maxSize')
          ? parseFloat(searchParams.get('maxSize') as string)
          : undefined,
        newTransactionOnly: searchParams.get('newTransactionOnly')
          ? searchParams.get('newTransactionOnly') === 'true'
          : undefined,
      },
      sort: {
        orderBy: searchParams.get('orderBy') as
          | 'dealDate'
          | 'dealAmount'
          | undefined,
        orderDirection: searchParams.get('orderDirection') as
          | 'asc'
          | 'desc'
          | undefined,
      },
    });

    return Response.json(result);
  } catch (error) {
    logger.error('국토부 API 조회 오류', { error });

    return Response.json(
      {
        message: '서버 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}
