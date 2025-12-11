/**
 * GitHub Actions용 배치 스크립트
 * 국토부 API에서 거래 데이터를 조회하여 Firestore에 저장
 */
import { AdminFirestoreClient } from '@polymorph/firebase';

import * as dotenv from 'dotenv';

import { convertGovApiItemToTransactions } from '../src/app/api/transactions/services/converter';
import { fetchGovApiData } from '../src/app/api/transactions/services/legacy-api';
import regionCodesData from '../src/entities/region/models/codes.json';

// .env.local 파일 로드 (로컬 실행 시)
dotenv.config({ path: '.env.local' });

const CONCURRENCY_LIMIT = 10; // 동시 처리 제한

interface RegionData {
  name: string;
  children: Array<{ code: string; name: string }>;
}

const regionCodes = (regionCodesData as RegionData[]).flatMap(region =>
  region.children.map(child => child.code)
);

/**
 * 현재 월 (YYYYMM)
 */
function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}${month}`;
}

/**
 * 지난 달 (YYYYMM)
 */
function getLastMonth(): string {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}${month}`;
}

/**
 * 특정 월의 거래 데이터 조회
 */
async function fetchTransactionsForMonth(
  regionCode: string,
  dealYearMonth: string
): Promise<string[]> {
  try {
    console.log(`[${regionCode}] Fetching ${dealYearMonth}...`);
    const govApiItems = await fetchGovApiData(regionCode, dealYearMonth);
    const transactions = convertGovApiItemToTransactions(
      govApiItems,
      regionCode
    );
    const transactionIds = transactions
      .map((tx: any) => tx.transactionId || tx.id)
      .filter(Boolean);

    console.log(
      `[${regionCode}] ${dealYearMonth}: ${transactionIds.length} transactions`
    );
    return transactionIds;
  } catch (error) {
    console.error(`[${regionCode}] Error fetching ${dealYearMonth}:`, error);
    return [];
  }
}

/**
 * 한 지역의 두 달 데이터 처리
 */
async function processRegion(
  firestoreClient: AdminFirestoreClient,
  regionCode: string,
  months: string[]
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    console.log(`\n[${regionCode}] Starting...`);

    // 두 달 데이터 병렬 조회
    const [idsMonth1, idsMonth2] = await Promise.all([
      fetchTransactionsForMonth(regionCode, months[0]),
      fetchTransactionsForMonth(regionCode, months[1]),
    ]);

    // 데이터 병합 및 중복 제거
    const allTransactionIds = Array.from(new Set([...idsMonth1, ...idsMonth2]));

    // Firestore에 저장 (재시도 포함)
    // KST 기준 날짜 (UTC+9)
    const now = new Date();
    const kstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const today = kstDate.toISOString().split('T')[0].replace(/-/g, '');
    const docId = `${today}_${regionCode}`;

    const MAX_RETRIES = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await firestoreClient.createDocumentWithId(docId, {
          regionCode,
          transactionIds: allTransactionIds,
          createdAt: new Date().toISOString(),
          months: months,
        });

        if (!result.success) {
          throw result.error || new Error('Unknown error');
        }

        console.log(
          `[${regionCode}] ✅ Saved ${allTransactionIds.length} transactions`
        );
        return {
          success: true,
          count: allTransactionIds.length,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < MAX_RETRIES) {
          console.log(`[${regionCode}] ⚠️  Retry ${attempt}/${MAX_RETRIES}...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw lastError;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[${regionCode}] ❌ Error:`, errorMessage);
    return {
      success: false,
      count: 0,
      error: errorMessage,
    };
  }
}

/**
 * 제한된 동시 실행으로 배열 처리
 */
async function processWithLimit<T, R>(
  items: T[],
  limit: number,
  processor: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += limit) {
    const batch = items.slice(i, i + limit);
    console.log(
      `\n🔄 Processing batch ${Math.floor(i / limit) + 1}/${Math.ceil(items.length / limit)} (${batch.length} regions)`
    );

    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);

    // API Rate Limit 방지를 위한 짧은 대기
    if (i + limit < items.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * 메인 실행 함수
 */
async function main(): Promise<void> {
  const startTime = Date.now();
  console.log('🚀 Batch job started at', new Date().toISOString());

  // Firebase 초기화
  let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';

  // Private key 형식 정규화
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, '\n');

  const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: privateKey,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    universe_domain: 'googleapis.com',
  };

  if (
    !serviceAccount.project_id ||
    !serviceAccount.private_key ||
    !serviceAccount.client_email
  ) {
    throw new Error('Required Firebase environment variables are not set');
  }

  if (!process.env.NEXT_PUBLIC_GO_DATA_API_KEY) {
    throw new Error(
      'NEXT_PUBLIC_GO_DATA_API_KEY environment variable is not set'
    );
  }

  const firestoreClient = new AdminFirestoreClient({
    serviceAccount,
    collectionName: 'legacy-transactions',
  });

  // 처리할 월 정보 (현재월, 지난달)
  const months = [getCurrentMonth(), getLastMonth()];
  console.log('📅 Target months:', months);
  console.log('🏢 Total regions:', regionCodes.length);

  // 모든 지역 처리
  const results = await processWithLimit(
    regionCodes,
    CONCURRENCY_LIMIT,
    regionCode => processRegion(firestoreClient, regionCode, months)
  );

  // 결과 집계
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  const totalArchived = results.reduce((sum, r) => sum + r.count, 0);
  const errors = results
    .filter(r => !r.success)
    .map((r, idx) => ({
      regionCode: regionCodes[idx],
      error: r.error || 'Unknown error',
    }));

  const duration = Date.now() - startTime;

  // 최종 결과 출력
  console.log('\n' + '='.repeat(60));
  console.log('✨ Batch job completed');
  console.log('='.repeat(60));
  console.log(`✅ Success: ${successCount} regions`);
  console.log(`❌ Failed: ${failureCount} regions`);
  console.log(`📊 Total transactions: ${totalArchived}`);
  console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`);

  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(({ regionCode, error }) => {
      console.log(`  - ${regionCode}: ${error}`);
    });
  }

  // 실패가 있으면 exit code 1
  if (failureCount > 0) {
    process.exit(1);
  }
}

// 실행
main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
