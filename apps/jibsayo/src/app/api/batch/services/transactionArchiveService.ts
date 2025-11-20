/**
 * 거래 ID 스냅샷 저장 서비스
 * 매일 각 지역의 모든 거래 ID를 저장
 */
import { COLLECTIONS } from '@/app/api/consts';
import { getFirestoreClient } from '@/app/api/shared/libs/fireStore';
import { logger } from '@/app/api/shared/utils/logger';

import type { TransactionArchive } from '../models/types';

const archiveClient = getFirestoreClient(COLLECTIONS.LEGACY_TRANSACTIONS);

/**
 * 거래 ID 스냅샷 저장
 * Document ID: "{YYYYMMDD}_{regionCode}" (예: "20251119_11740")
 *
 * 지역의 모든 거래 ID를 한 배열에 병합하여 저장합니다.
 *
 * @param regionCode 지역코드
 * @param transactionIds 거래 ID 배열 (여러 달 데이터 병합됨)
 */
export async function saveTransactionArchive(
  regionCode: string,
  transactionIds: string[]
): Promise<void> {
  try {
    const kstDate = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
    const today = kstDate.toISOString().split('T')[0];
    const docId = `${today.replace(/-/g, '')}_${regionCode}`;

    logger.info('Saving transaction archive', {
      docId,
      regionCode,
      count: transactionIds.length,
    });

    const archive: TransactionArchive = {
      regionCode,
      date: today,
      transactionIds,
      savedAt: new Date(),
    };

    await archiveClient.createDocumentWithId(docId, archive);

    logger.info('Successfully saved transaction archive', {
      docId,
      totalCount: transactionIds.length,
    });
  } catch (error) {
    logger.error('Failed to save transaction archive', {
      error: error instanceof Error ? error.message : String(error),
      regionCode,
    });
    throw error;
  }
}
