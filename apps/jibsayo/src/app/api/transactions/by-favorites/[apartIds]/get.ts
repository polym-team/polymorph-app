import { logger } from '@/app/api/shared/utils/logger';

import { NextRequest } from 'next/server';

import {
  getHighestPriceTransactionByApartId,
  getLatestTransactionByApartId,
  getLowestPriceTransactionByApartId,
  hasNewTransactionByApartId,
} from './services/db';
import {
  ApartmentTransactionSummary,
  TransactionsByFavoritesResponse,
} from './types';

export async function GET(
  request: NextRequest,
  { params }: { params: { apartIds: string } }
): Promise<Response> {
  if (!params?.apartIds) {
    return Response.json(
      {
        message: '필수 파라미터(apartIds)가 누락되었습니다.',
      },
      { status: 400 }
    );
  }

  const apartIdStrings = params.apartIds.split(',');
  const apartIds = apartIdStrings
    .map(id => parseInt(id.trim(), 10))
    .filter(id => !isNaN(id));

  if (apartIds.length === 0) {
    return Response.json(
      {
        message: '유효한 아파트 ID가 없습니다.',
      },
      { status: 400 }
    );
  }

  try {
    const results: ApartmentTransactionSummary[] = await Promise.all(
      apartIds.map(async apartId => {
        const [latestTransaction, highestPriceTransaction, lowestPriceTransaction, hasNewTransaction] =
          await Promise.all([
            getLatestTransactionByApartId(apartId),
            getHighestPriceTransactionByApartId(apartId),
            getLowestPriceTransactionByApartId(apartId),
            hasNewTransactionByApartId(apartId),
          ]);

        return {
          apartId,
          latestTransaction,
          highestPriceTransaction,
          lowestPriceTransaction,
          hasNewTransaction,
        };
      })
    );

    const response: TransactionsByFavoritesResponse = {
      results,
    };

    return Response.json(response);
  } catch (error) {
    logger.error(
      '[/api/transactions/by-favorites] 즐겨찾기 거래내역 조회 오류',
      { error }
    );

    return Response.json(
      {
        message: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
