import { COLLECTIONS } from '@/app/api/consts';
import { getFirestoreClient } from '@/app/api/shared/libs/fireStore';

import { NewTransactionsResponse, TransactionArchive } from './models/types';
import { extractNewTransactionIds } from './services/transactionService';
import { getPreviousDate, getTodayKST } from './utils/date';

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get('area');

    if (!area) {
      return Response.json(
        { message: '필수 파라미터(area)가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // Firestore 클라이언트 초기화
    const archiveClient = getFirestoreClient(COLLECTIONS.LEGACY_TRANSACTIONS);

    // KST 기준 오늘 날짜 계산
    const today = getTodayKST();
    const yesterday = getPreviousDate(today);

    // 1. 오늘 날짜 문서 확인
    let currentDate = today;
    let currentDocId = `${today}_${area}`;
    let currentDoc = await archiveClient.getDocument<TransactionArchive>(
      currentDocId
    );

    // 2. 오늘 문서가 없으면 어제 날짜로 시도
    if (!currentDoc?.exists) {
      currentDate = yesterday;
      currentDocId = `${yesterday}_${area}`;
      currentDoc = await archiveClient.getDocument<TransactionArchive>(
        currentDocId
      );

      // 3. 어제 문서도 없으면 신규 거래 없음
      if (!currentDoc?.exists) {
        const response: NewTransactionsResponse = {
          count: 0,
          transactionIds: [],
        };
        return Response.json(response);
      }
    }

    // 4. 이전 날짜 문서 조회 (currentDate의 하루 전)
    const previousDate = getPreviousDate(currentDate);
    const previousDocId = `${previousDate}_${area}`;
    const previousDoc = await archiveClient.getDocument<TransactionArchive>(
      previousDocId
    );

    // 5. 이전 날짜 문서가 없으면 빈 배열 반환
    if (!previousDoc?.exists) {
      const response: NewTransactionsResponse = {
        count: 0,
        transactionIds: [],
      };
      return Response.json(response);
    }

    // 6. 신규 거래 ID 추출 (증가분 계산)
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
