import { logger } from '@/app/api/shared/utils/logger';

import { NextRequest } from 'next/server';

import { convertToMonthlyTransactionsByIds } from './services/converter';
import {
  getAvailableSizesByApartIds,
  getMonthlyTransactionsByApartIds,
} from './services/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { apartIds: string } }
): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const periodParam = searchParams.get('period');
  const sizesParam = searchParams.get('sizes');

  if (!params?.apartIds) {
    return Response.json(
      {
        message: '필수 파라미터(apartIds)가 누락되었습니다.',
      },
      { status: 400 }
    );
  }

  const apartIds = params.apartIds.split(',').map(Number);
  const period = periodParam ? Number(periodParam) : undefined;

  if (apartIds.some(isNaN)) {
    return Response.json(
      {
        message: 'apartIds는 쉼표로 구분된 숫자여야 합니다.',
      },
      { status: 400 }
    );
  }

  let sizesByApart: Map<number, [number, number][]> | undefined;
  if (sizesParam) {
    try {
      const sizesObj = JSON.parse(decodeURIComponent(sizesParam)) as Record<
        string,
        [number, number][]
      >;
      sizesByApart = new Map(
        Object.entries(sizesObj).map(([apartId, sizes]) => [
          Number(apartId),
          sizes,
        ])
      );
    } catch {
      return Response.json(
        { message: 'sizes 파라미터 형식이 올바르지 않습니다.' },
        { status: 400 }
      );
    }
  }

  try {
    const availableSizesMap = await getAvailableSizesByApartIds(apartIds);

    const dbRows = await getMonthlyTransactionsByApartIds({
      apartIds,
      period,
      sizesByApart,
    });

    const data = convertToMonthlyTransactionsByIds(dbRows, availableSizesMap);
    return Response.json(data);
  } catch (error) {
    logger.error(
      '[/api/transactions/by-ids] 여러 아파트 월별 거래 통계 조회 오류',
      {
        error,
      }
    );

    return Response.json(
      {
        message: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
