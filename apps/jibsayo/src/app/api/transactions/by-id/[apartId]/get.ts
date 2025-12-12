import { logger } from '@/app/api/shared/utils/logger';

import { NextRequest } from 'next/server';

import { covertToTransactionItem } from './services/converter';
import {
  buildWhereConditions,
  getTransactionsByApartId,
  getTransactionTotalCountByApartId,
} from './services/db';
import { OrderBy, OrderDirection, TransactionsByTokenResponse } from './types';

export async function GET(
  request: NextRequest,
  { params }: { params: { apartId: string } }
): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const pageIndexParam = searchParams.get('pageIndex'); // 페이지 인덱스
  const pageSizeParam = searchParams.get('pageSize'); // 페이지 크기
  const periodParam = searchParams.get('period'); // 기간 (예: 최근 5년 -> 60개월)
  const orderBy = searchParams.get('orderBy'); // 정렬 기준
  const orderDirection = searchParams.get('orderDirection'); // 정렬 방향

  if (!params?.apartId || !pageIndexParam || !pageSizeParam) {
    return Response.json(
      {
        message:
          '필수 파라미터(apartId, pageIndex, pageSize)가 누락되었습니다.',
      },
      { status: 400 }
    );
  }

  const apartId = Number(params.apartId);
  const pageIndex = Number(pageIndexParam);
  const pageSize = Number(pageSizeParam);
  const period = periodParam ? Number(periodParam) : undefined;

  const { whereConditions, queryParams } = buildWhereConditions({
    apartId,
    period,
  });

  try {
    const totalCount = await getTransactionTotalCountByApartId(
      whereConditions,
      queryParams
    );
    const transactions = covertToTransactionItem(
      await getTransactionsByApartId({
        whereConditions,
        queryParams,
        pageIndex,
        pageSize,
        orderBy: orderBy ? (orderBy as OrderBy) : undefined,
        orderDirection: orderDirection
          ? (orderDirection as OrderDirection)
          : undefined,
      })
    );

    const response: TransactionsByTokenResponse = {
      totalCount,
      transactions,
    };

    return Response.json(response);
  } catch (error) {
    logger.error('[/api/transactions/by-id] 거래내역 조회 오류', { error });

    return Response.json(
      {
        message: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
