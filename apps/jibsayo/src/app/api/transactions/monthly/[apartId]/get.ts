import { logger } from '@/app/api/shared/utils/logger';

import { NextRequest } from 'next/server';

import { convertToMonthlyTransactions } from './services/converter';
import { getMonthlyTransactionsByApartId } from './services/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { apartId: string } }
): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const periodParam = searchParams.get('period');
  const sizesParam = searchParams.get('sizes');

  if (!params?.apartId) {
    return Response.json(
      {
        message: '필수 파라미터(apartId)가 누락되었습니다.',
      },
      { status: 400 }
    );
  }

  const apartId = Number(params.apartId);
  const period = periodParam ? Number(periodParam) : undefined;
  const sizes = sizesParam
    ? (JSON.parse(sizesParam) as [number, number][])
    : undefined;

  try {
    const dbRows = await getMonthlyTransactionsByApartId({
      apartId,
      period,
      sizes,
    });

    const data = convertToMonthlyTransactions(dbRows);
    return Response.json(data);
  } catch (error) {
    logger.error('[/api/transactions/monthly] 월별 거래 통계 조회 오류', {
      error,
    });

    return Response.json(
      {
        message: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
