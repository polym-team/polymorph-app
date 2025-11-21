import { COLLECTIONS } from '@/app/api/consts';
import { getFirestoreClient } from '@/app/api/shared/libs/fireStore';

import { NewTransactionsResponse, TransactionArchive } from './models/types';
import { extractNewTransactionIds } from './services/transactionService';
import { getPreviousDate } from './utils/date';

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get('area');
    const date = searchParams.get('date');

    if (!area || !date) {
      return Response.json(
        { message: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // Firestore 클라이언트 초기화
    const archiveClient = getFirestoreClient(COLLECTIONS.LEGACY_TRANSACTIONS);

    // 문서 ID 생성
    const currentDocId = `${date}_${area}`;
    const previousDate = getPreviousDate(date);
    const previousDocId = `${previousDate}_${area}`;

    // 요청 날짜와 이전 날짜의 문서 조회
    const [currentDoc, previousDoc] = await Promise.all([
      archiveClient.getDocument<TransactionArchive>(currentDocId),
      archiveClient.getDocument<TransactionArchive>(previousDocId),
    ]);

    // 요청 날짜의 문서가 없으면 빈 배열 반환
    if (!currentDoc?.exists) {
      const response: NewTransactionsResponse = {
        count: 0,
        transactionIds: [],
      };
      return Response.json(response);
    }

    // 이전 날짜의 문서가 없으면 빈 배열 반환
    if (!previousDoc?.exists) {
      const response: NewTransactionsResponse = {
        count: 0,
        transactionIds: [],
      };
      return Response.json(response);
    }

    // 신규 거래 ID 추출 (증가분 계산)
    const newTransactionIds = extractNewTransactionIds(
      currentDoc.data.transactionIds,
      previousDoc.data.transactionIds
    );

    const response: NewTransactionsResponse = {
      count: newTransactionIds.length,
      transactionIds: newTransactionIds,
    };

    return Response.json(response);
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
