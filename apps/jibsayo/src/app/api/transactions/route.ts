import { logger } from '@/app/api/shared/utils/logger';

import { TransactionItem, TransactionsResponse } from './types';
import { fetchGovApiData } from './services/api';
import { convertGovApiItemToTransactions } from './services/converter';

// 동적 라우트로 설정 (정적 빌드 시 request.url 사용으로 인한 오류 방지)
export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get('area'); // 지역 코드 (예: 11740)
    const createDt = searchParams.get('createDt'); // 거래년월 (예: 202510)

    if (!area || !createDt) {
      return Response.json(
        { message: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 국토부 API 호출
    const govApiItems = await fetchGovApiData(area, createDt.replace(/-/g, ''));

    // 내부 형식으로 변환 (신규 거래 여부 포함)
    const transactions: TransactionItem[] = convertGovApiItemToTransactions(
      govApiItems,
      area
    );

    const result: TransactionsResponse = {
      count: transactions.length,
      list: transactions,
    };

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
