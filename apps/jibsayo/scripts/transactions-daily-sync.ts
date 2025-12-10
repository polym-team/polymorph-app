import { query } from '../src/app/api/shared/libs/database';
import { fetchGovApiData } from '../src/app/api/transactions/services/api';
import {
  convertGovApiItemToDbRow,
  TransactionDbRow,
} from '../src/app/api/transactions/services/batch';
import regionCodesData from '../src/entities/region/models/codes.json';

const REGION_BATCH_SIZE = 10;

interface TransactionWithId extends TransactionDbRow {
  _dbId?: number;
}

// 고유 키 생성
function createUniqueKey(row: TransactionDbRow): string {
  return `${row.region_code}|${row.apart_id || ''}|${row.apart_name}|${row.deal_date}|${row.deal_amount}|${row.exclusive_area}|${row.floor || ''}`;
}

// Diff 처리 (1:1 배열 매칭)
function removeExactMatches(
  yesterday: TransactionDbRow[],
  today: TransactionDbRow[]
): {
  yesterdayRemaining: TransactionDbRow[];
  todayRemaining: TransactionDbRow[];
} {
  const yesterdayRemaining = [...yesterday];
  const todayRemaining = [...today];

  // 역순으로 순회 (splice 안전)
  for (let i = yesterdayRemaining.length - 1; i >= 0; i--) {
    const yRow = yesterdayRemaining[i];

    const matchIdx = todayRemaining.findIndex(
      t => JSON.stringify(t) === JSON.stringify(yRow)
    );

    if (matchIdx !== -1) {
      yesterdayRemaining.splice(i, 1);
      todayRemaining.splice(matchIdx, 1);
    }
  }

  return { yesterdayRemaining, todayRemaining };
}

// DB row를 TransactionDbRow로 변환
function convertDbRowToTransactionDbRow(dbRow: any): TransactionDbRow {
  return {
    region_code: dbRow.region_code,
    apart_id: dbRow.apart_id,
    apart_name: dbRow.apart_name,
    deal_date: dbRow.deal_date,
    deal_amount: dbRow.deal_amount,
    exclusive_area: parseFloat(dbRow.exclusive_area),
    floor: dbRow.floor,
    jibun: dbRow.jibun || '',
    building_dong: dbRow.building_dong,
    estate_agent_region: dbRow.estate_agent_region,
    registration_date: dbRow.registration_date,
    cancellation_type: dbRow.cancellation_type,
    cancellation_date: dbRow.cancellation_date,
    deal_type: dbRow.deal_type,
    seller_type: dbRow.seller_type,
    buyer_type: dbRow.buyer_type,
    is_land_lease: Boolean(dbRow.is_land_lease),
  };
}

// DB id 매핑
async function loadYesterdayWithIds(
  yesterday: TransactionDbRow[],
  threeMonthsAgo: string
): Promise<TransactionWithId[]> {
  // DB에서 최근 3개월 데이터 로드
  const dbRows = await query<any[]>(
    `
    SELECT * FROM transactions
    WHERE deal_date >= ?
  `,
    [threeMonthsAgo]
  );

  // 어제 API 데이터와 DB id 매핑
  return yesterday.map(yRow => {
    const dbRow = dbRows.find(db => {
      // DB row를 TransactionDbRow 형식으로 변환하여 비교
      const dbConverted = convertDbRowToTransactionDbRow(db);
      return JSON.stringify(dbConverted) === JSON.stringify(yRow);
    });

    return {
      ...yRow,
      _dbId: dbRow?.id,
    };
  });
}

// UPDATE/INSERT 처리
async function syncTransactions(
  yesterdayWithIds: TransactionWithId[],
  todayRemaining: TransactionDbRow[]
): Promise<{ updated: number; inserted: number }> {
  let updated = 0;
  let inserted = 0;

  for (const todayRow of todayRemaining) {
    const key = createUniqueKey(todayRow);

    // 고유 키로 어제 데이터에서 찾기
    const matchedIdx = yesterdayWithIds.findIndex(
      y => createUniqueKey(y) === key
    );

    if (matchedIdx !== -1) {
      const matched = yesterdayWithIds[matchedIdx];

      if (matched._dbId) {
        // UPDATE (모든 필드를 오늘 데이터로)
        await query(
          `
          UPDATE transactions SET
            region_code = ?,
            apart_id = ?,
            apart_name = ?,
            deal_date = ?,
            deal_amount = ?,
            exclusive_area = ?,
            floor = ?,
            jibun = ?,
            building_dong = ?,
            estate_agent_region = ?,
            registration_date = ?,
            cancellation_type = ?,
            cancellation_date = ?,
            deal_type = ?,
            seller_type = ?,
            buyer_type = ?,
            is_land_lease = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
          [
            todayRow.region_code,
            todayRow.apart_id,
            todayRow.apart_name,
            todayRow.deal_date,
            todayRow.deal_amount,
            todayRow.exclusive_area,
            todayRow.floor,
            todayRow.jibun,
            todayRow.building_dong,
            todayRow.estate_agent_region,
            todayRow.registration_date,
            todayRow.cancellation_type,
            todayRow.cancellation_date,
            todayRow.deal_type,
            todayRow.seller_type,
            todayRow.buyer_type,
            todayRow.is_land_lease,
            matched._dbId,
          ]
        );
        updated++;
      }

      // 메모리에서 제거
      yesterdayWithIds.splice(matchedIdx, 1);
    } else {
      // INSERT
      await query(
        `
        INSERT INTO transactions (
          region_code, apart_id, apart_name, deal_date, deal_amount,
          exclusive_area, floor, jibun, building_dong,
          estate_agent_region, registration_date,
          cancellation_type, cancellation_date,
          deal_type, seller_type, buyer_type, is_land_lease,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
        [
          todayRow.region_code,
          todayRow.apart_id,
          todayRow.apart_name,
          todayRow.deal_date,
          todayRow.deal_amount,
          todayRow.exclusive_area,
          todayRow.floor,
          todayRow.jibun,
          todayRow.building_dong,
          todayRow.estate_agent_region,
          todayRow.registration_date,
          todayRow.cancellation_type,
          todayRow.cancellation_date,
          todayRow.deal_type,
          todayRow.seller_type,
          todayRow.buyer_type,
          todayRow.is_land_lease,
        ]
      );
      inserted++;
    }
  }

  return { updated, inserted };
}

// API 조회 (최근 N개월)
async function fetchApiForRecentMonths(
  regionCode: string,
  monthCount: number,
  baseDate: Date
): Promise<TransactionDbRow[]> {
  const allRows: TransactionDbRow[] = [];

  for (let i = 0; i < monthCount; i++) {
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const yearMonth = `${year}${month}`;

    try {
      const govApiItems = await fetchGovApiData(regionCode, yearMonth);
      const rows = govApiItems.map(item =>
        convertGovApiItemToDbRow(item, regionCode)
      );
      allRows.push(...rows);
    } catch (error) {
      console.error(
        `[${regionCode}] ${yearMonth} API 조회 실패:`,
        error instanceof Error ? error.message : error
      );
      // 실패해도 계속 진행
    }
  }

  return allRows;
}

// 지역별 처리
async function processRegion(regionCode: string): Promise<{
  success: boolean;
  updated: number;
  inserted: number;
}> {
  try {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const threeMonthsAgoStr = threeMonthsAgo.toISOString().split('T')[0];

    console.log(`[${regionCode}] 처리 시작...`);

    // 1. 어제 API 조회
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = await fetchApiForRecentMonths(
      regionCode,
      3,
      yesterdayDate
    );

    // 2. 오늘 API 조회
    const today = await fetchApiForRecentMonths(regionCode, 3, now);

    console.log(
      `[${regionCode}] API 조회 완료 - 어제: ${yesterday.length}건, 오늘: ${today.length}건`
    );

    // 3. Diff (1:1 매칭)
    const { yesterdayRemaining, todayRemaining } = removeExactMatches(
      yesterday,
      today
    );

    console.log(
      `[${regionCode}] Diff 완료 - 변경/신규: ${todayRemaining.length}건`
    );

    // 4. DB id 매핑
    const yesterdayWithIds = await loadYesterdayWithIds(
      yesterdayRemaining,
      threeMonthsAgoStr
    );

    // 5. UPDATE/INSERT
    const { updated, inserted } = await syncTransactions(
      yesterdayWithIds,
      todayRemaining
    );

    console.log(
      `[${regionCode}] ✅ 완료 - UPDATE: ${updated}건, INSERT: ${inserted}건`
    );

    return { success: true, updated, inserted };
  } catch (error) {
    console.error(
      `[${regionCode}] ❌ 처리 실패:`,
      error instanceof Error ? error.message : error
    );
    return { success: false, updated: 0, inserted: 0 };
  }
}

// 메인 함수
async function main(): Promise<void> {
  console.log('🚀 Daily sync started');
  console.log(`시작 시각: ${new Date().toLocaleString('ko-KR')}`);
  console.log('='.repeat(60));

  const regionCodes = regionCodesData.flatMap(region =>
    region.children.map(child => child.code)
  );

  console.log(`처리할 지역 수: ${regionCodes.length}개\n`);

  const results: {
    success: boolean;
    updated: number;
    inserted: number;
  }[] = [];

  // 10개씩 병렬 처리
  for (let i = 0; i < regionCodes.length; i += REGION_BATCH_SIZE) {
    const batch = regionCodes.slice(i, i + REGION_BATCH_SIZE);
    console.log(
      `\n배치 ${Math.floor(i / REGION_BATCH_SIZE) + 1}/${Math.ceil(regionCodes.length / REGION_BATCH_SIZE)} 처리 중...`
    );

    const batchResults = await Promise.all(
      batch.map(code => processRegion(code))
    );
    results.push(...batchResults);

    // Rate limit 대기
    if (i + REGION_BATCH_SIZE < regionCodes.length) {
      console.log('Rate limit 대기 중...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // 결과 출력
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  const totalUpdated = results.reduce((sum, r) => sum + r.updated, 0);
  const totalInserted = results.reduce((sum, r) => sum + r.inserted, 0);

  console.log('\n' + '='.repeat(60));
  console.log('✨ Daily sync completed');
  console.log(`완료 시각: ${new Date().toLocaleString('ko-KR')}`);
  console.log(`✅ 성공: ${successCount}/${regionCodes.length} 지역`);
  if (failCount > 0) {
    console.log(`❌ 실패: ${failCount}/${regionCodes.length} 지역`);
  }
  console.log(`📝 총 업데이트: ${totalUpdated}건`);
  console.log(`➕ 총 신규 등록: ${totalInserted}건`);
  console.log('='.repeat(60));
}

main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
