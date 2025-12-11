import * as dotenv from 'dotenv';

import { getDbPool, query } from '../src/app/api/shared/libs/database';
import { fetchGovApiData } from '../src/app/api/transactions/services/api';
import { GovApiItem } from '../src/app/api/transactions/types';
import regionCodesData from '../src/entities/region/models/codes.json';

// .env.local 파일 로드 (로컬 실행 시)
dotenv.config({ path: '.env.local' });

const REGION_BATCH_SIZE = 10;

// ============================================================
// 타입 정의
// ============================================================

interface TransactionDbRow {
  region_code: string;
  apart_id: number | null;
  apart_name: string;
  deal_date: string | null;
  deal_amount: number | null;
  exclusive_area: number | null;
  floor: number | null;
  building_dong: string | null;
  estate_agent_region: string | null;
  registration_date: string | null;
  cancellation_type: 'NONE' | 'CANCELED';
  cancellation_date: string | null;
  deal_type: string | null;
  seller_type: string | null;
  buyer_type: string | null;
  is_land_lease: boolean;
}

// ============================================================
// 변환 함수들 (업로드 스크립트와 동일한 이름)
// ============================================================

function parseDealAmount(dealAmountStr: any): number | null {
  if (!dealAmountStr) return null;
  const str = String(dealAmountStr).replace(/,/g, '').trim();
  const num = parseInt(str);
  return isNaN(num) || num <= 0 ? null : num;
}

function formatDate(year: any, month: any, day: any): string | null {
  if (!year || !month || !day) return null;
  const paddedMonth = String(month).padStart(2, '0');
  const paddedDay = String(day).padStart(2, '0');
  return `${year}-${paddedMonth}-${paddedDay}`;
}

function mapDealType(dealingGbn: any): string | null {
  if (dealingGbn === '중개거래') return 'AGENCY';
  if (dealingGbn === '직거래') return 'DIRECT';
  return null;
}

function mapSellerBuyerType(gbn: any): string | null {
  const trimmed = gbn ? String(gbn).trim() : '';
  if (!trimmed || trimmed === ' ') return null;
  if (trimmed === '개인') return 'IND';
  if (trimmed === '법인') return 'CORP';
  if (trimmed === '공공기관') return 'PUBLIC';
  return 'ETC';
}

function mapCancellationType(cdealType: any): 'NONE' | 'CANCELED' {
  const trimmed = cdealType ? String(cdealType).trim() : '';
  if (!trimmed || trimmed === ' ') return 'NONE';
  return 'CANCELED';
}

function parseDate(dateStr: any): string | null {
  if (!dateStr) return null;
  const str = String(dateStr);
  if (str.trim() === ' ' || str.trim() === '') return null;
  const trimmed = str.trim();

  // 8자리 숫자 형식 (예: "20200323")
  if (/^\d{8}$/.test(trimmed)) {
    const year = trimmed.substring(0, 4);
    const month = trimmed.substring(4, 6);
    const day = trimmed.substring(6, 8);
    return `${year}-${month}-${day}`;
  }

  // 점 구분 형식 (예: "20.03.23")
  if (/^\d{2}\.\d{2}\.\d{2}$/.test(trimmed)) {
    const parts = trimmed.split('.');
    const year = `20${parts[0]}`;
    const month = parts[1];
    const day = parts[2];
    return `${year}-${month}-${day}`;
  }

  return null;
}

function calculateExclusiveArea(excluUseAr: any): number | null {
  const exclusiveArea =
    excluUseAr && String(excluUseAr).trim() !== ''
      ? parseFloat(excluUseAr)
      : null;
  const validExclusiveArea =
    exclusiveArea !== null && exclusiveArea > 0 ? exclusiveArea : null;
  return validExclusiveArea;
}

function calculateFloor(floor: any): number | null {
  const parsedFloor =
    floor && String(floor).trim() !== '' ? parseInt(floor) : null;
  const validFloor =
    parsedFloor !== null && parsedFloor >= 0 ? parsedFloor : null;
  return validFloor;
}

// GovApiItem을 DB Row로 변환
function convertGovApiItemToDbRow(
  item: GovApiItem,
  regionCode: string
): TransactionDbRow {
  // building_dong: 빈 문자열과 공백 문자(" ") 모두 null 처리
  const buildingDong =
    item.aptDong &&
    String(item.aptDong).trim() !== '' &&
    String(item.aptDong).trim() !== ' '
      ? String(item.aptDong).trim()
      : null;

  // estate_agent_region: 빈 문자열과 공백 문자(" ") 모두 null 처리
  const estateAgentRegion =
    item.estateAgentSggNm &&
    String(item.estateAgentSggNm).trim() !== '' &&
    String(item.estateAgentSggNm).trim() !== ' '
      ? String(item.estateAgentSggNm).trim()
      : null;

  return {
    region_code: regionCode,
    apart_id: null,
    apart_name: item.aptNm!,
    deal_date: formatDate(item.dealYear, item.dealMonth, item.dealDay),
    deal_amount: parseDealAmount(item.dealAmount),
    exclusive_area: calculateExclusiveArea(item.excluUseAr),
    floor: calculateFloor(item.floor),
    building_dong: buildingDong,
    estate_agent_region: estateAgentRegion,
    registration_date: parseDate(item.rgstDate),
    cancellation_type: mapCancellationType(item.cdealType),
    cancellation_date: parseDate(item.cdealDay),
    deal_type: mapDealType(item.dealingGbn),
    seller_type: mapSellerBuyerType(item.slerGbn),
    buyer_type: mapSellerBuyerType(item.buyerGbn),
    is_land_lease: String(item.landLeaseholdGbn || '').trim() === '토지임대부',
  };
}

// ============================================================
// Diff 로직
// ============================================================

interface TransactionWithId extends TransactionDbRow {
  _dbId?: number;
}

interface MatchingResult {
  toUpdate: Array<{ dbRow: TransactionWithId; newRow: TransactionDbRow }>;
  toDelete: TransactionWithId[];
  toInsert: TransactionDbRow[];
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

// DB row를 TransactionWithId로 변환 (id 포함)
function convertDbRowToTransactionWithId(dbRow: any): TransactionWithId {
  return {
    region_code: dbRow.region_code,
    apart_id: dbRow.apart_id,
    apart_name: dbRow.apart_name,
    deal_date: dbRow.deal_date,
    deal_amount: dbRow.deal_amount,
    exclusive_area: parseFloat(dbRow.exclusive_area),
    floor: dbRow.floor,
    building_dong: dbRow.building_dong,
    estate_agent_region: dbRow.estate_agent_region,
    registration_date: dbRow.registration_date,
    cancellation_type: dbRow.cancellation_type,
    cancellation_date: dbRow.cancellation_date,
    deal_type: dbRow.deal_type,
    seller_type: dbRow.seller_type,
    buyer_type: dbRow.buyer_type,
    is_land_lease: Boolean(dbRow.is_land_lease),
    _dbId: dbRow.id,
  };
}

// DB에서 최근 3개월 데이터 조회 (어제까지의 상태)
async function loadDbTransactions(
  regionCode: string,
  fromDate: string
): Promise<TransactionWithId[]> {
  const dbRows = await query<any[]>(
    `
    SELECT
      id,
      region_code,
      apart_id,
      apart_name,
      DATE_FORMAT(deal_date, '%Y-%m-%d') as deal_date,
      deal_amount,
      exclusive_area,
      floor,
      building_dong,
      estate_agent_region,
      DATE_FORMAT(registration_date, '%Y-%m-%d') as registration_date,
      cancellation_type,
      DATE_FORMAT(cancellation_date, '%Y-%m-%d') as cancellation_date,
      deal_type,
      seller_type,
      buyer_type,
      is_land_lease
    FROM transactions
    WHERE region_code = ? AND deal_date >= ?
  `,
    [regionCode, fromDate]
  );

  return dbRows.map(convertDbRowToTransactionWithId);
}

// Key 기반 매칭 및 분류
function matchByKey(
  dbRemaining: TransactionWithId[],
  apiRemaining: TransactionDbRow[]
): MatchingResult {
  const apiByKey = new Map<string, TransactionDbRow[]>();
  for (const apiRow of apiRemaining) {
    const key = createUniqueKey(apiRow);
    if (!apiByKey.has(key)) {
      apiByKey.set(key, []);
    }
    apiByKey.get(key)!.push(apiRow);
  }

  const toUpdate: Array<{
    dbRow: TransactionWithId;
    newRow: TransactionDbRow;
  }> = [];
  const toDelete: TransactionWithId[] = [];
  const toInsert: TransactionDbRow[] = [];
  const processedApiIndices = new Set<number>();

  for (const dbRow of dbRemaining) {
    const key = createUniqueKey(dbRow);
    const apiMatches = apiByKey.get(key) || [];

    if (apiMatches.length === 0) {
      toDelete.push(dbRow);
    } else if (apiMatches.length === 1) {
      toUpdate.push({ dbRow, newRow: apiMatches[0] });
      processedApiIndices.add(apiRemaining.indexOf(apiMatches[0]));
    } else {
      toUpdate.push({ dbRow, newRow: apiMatches[0] });
      processedApiIndices.add(apiRemaining.indexOf(apiMatches[0]));

      for (let i = 1; i < apiMatches.length; i++) {
        toInsert.push(apiMatches[i]);
        processedApiIndices.add(apiRemaining.indexOf(apiMatches[i]));
      }
    }
  }

  for (let i = 0; i < apiRemaining.length; i++) {
    if (!processedApiIndices.has(i)) {
      toInsert.push(apiRemaining[i]);
    }
  }

  return { toUpdate, toDelete, toInsert };
}

// DELETE 처리
async function deleteTransactions(
  toDelete: TransactionWithId[]
): Promise<number> {
  let deleted = 0;
  const deletesLog: string[] = [];

  for (const dbRow of toDelete) {
    if (dbRow._dbId) {
      deletesLog.push(
        `[DELETE #${dbRow._dbId}] ${dbRow.apart_name} | ${dbRow.deal_date} | ${dbRow.deal_amount}만원`
      );

      await query(`DELETE FROM transactions WHERE id = ?`, [dbRow._dbId]);

      deleted++;
    }
  }

  if (deletesLog.length > 0) {
    console.log('\n=== DELETE 목록 ===');
    deletesLog.forEach(log => console.log(log));
  }

  return deleted;
}

// UPDATE/INSERT 처리
async function updateAndInsertTransactions(
  toUpdate: Array<{ dbRow: TransactionWithId; newRow: TransactionDbRow }>,
  toInsert: TransactionDbRow[]
): Promise<{ updated: number; inserted: number }> {
  let updated = 0;
  let inserted = 0;

  const updatesLog: string[] = [];
  const insertsLog: string[] = [];

  for (const { dbRow, newRow } of toUpdate) {
    if (dbRow._dbId) {
      const changes: string[] = [];

      if (dbRow.registration_date !== newRow.registration_date) {
        changes.push(
          `등기일자: ${dbRow.registration_date} → ${newRow.registration_date}`
        );
      }
      if (dbRow.cancellation_type !== newRow.cancellation_type) {
        changes.push(
          `취소유형: ${dbRow.cancellation_type} → ${newRow.cancellation_type}`
        );
      }
      if (dbRow.cancellation_date !== newRow.cancellation_date) {
        changes.push(
          `취소일자: ${dbRow.cancellation_date} → ${newRow.cancellation_date}`
        );
      }
      if (dbRow.deal_type !== newRow.deal_type) {
        changes.push(`거래유형: ${dbRow.deal_type} → ${newRow.deal_type}`);
      }
      if (dbRow.seller_type !== newRow.seller_type) {
        changes.push(`매도자: ${dbRow.seller_type} → ${newRow.seller_type}`);
      }
      if (dbRow.buyer_type !== newRow.buyer_type) {
        changes.push(`매수자: ${dbRow.buyer_type} → ${newRow.buyer_type}`);
      }
      if (dbRow.building_dong !== newRow.building_dong) {
        changes.push(`동: ${dbRow.building_dong} → ${newRow.building_dong}`);
      }
      if (dbRow.estate_agent_region !== newRow.estate_agent_region) {
        changes.push(
          `중개사: ${dbRow.estate_agent_region} → ${newRow.estate_agent_region}`
        );
      }
      if (dbRow.is_land_lease !== newRow.is_land_lease) {
        changes.push(
          `토지임대: ${dbRow.is_land_lease} → ${newRow.is_land_lease}`
        );
      }

      updatesLog.push(
        `[UPDATE #${dbRow._dbId}] ${newRow.apart_name} | ${newRow.deal_date} | ${newRow.deal_amount}만원\n  변경사항: ${changes.join(', ')}`
      );

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
          newRow.region_code,
          newRow.apart_id,
          newRow.apart_name,
          newRow.deal_date,
          newRow.deal_amount,
          newRow.exclusive_area,
          newRow.floor,
          newRow.building_dong,
          newRow.estate_agent_region,
          newRow.registration_date,
          newRow.cancellation_type,
          newRow.cancellation_date,
          newRow.deal_type,
          newRow.seller_type,
          newRow.buyer_type,
          newRow.is_land_lease,
          dbRow._dbId,
        ]
      );

      updated++;
    }
  }

  for (const newRow of toInsert) {
    insertsLog.push(
      `[INSERT] ${newRow.apart_name} | ${newRow.deal_date} | ${newRow.deal_amount}만원 | ${newRow.exclusive_area}㎡ | ${newRow.floor}층`
    );

    await query(
      `
      INSERT INTO transactions (
        region_code, apart_id, apart_name, deal_date, deal_amount,
        exclusive_area, floor, building_dong,
        estate_agent_region, registration_date,
        cancellation_type, cancellation_date,
        deal_type, seller_type, buyer_type, is_land_lease,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
      [
        newRow.region_code,
        newRow.apart_id,
        newRow.apart_name,
        newRow.deal_date,
        newRow.deal_amount,
        newRow.exclusive_area,
        newRow.floor,
        newRow.building_dong,
        newRow.estate_agent_region,
        newRow.registration_date,
        newRow.cancellation_type,
        newRow.cancellation_date,
        newRow.deal_type,
        newRow.seller_type,
        newRow.buyer_type,
        newRow.is_land_lease,
      ]
    );

    inserted++;
  }

  if (updatesLog.length > 0) {
    console.log('\n=== UPDATE 목록 ===');
    updatesLog.forEach(log => console.log(log));
  }

  if (insertsLog.length > 0) {
    console.log('\n=== INSERT 목록 ===');
    insertsLog.forEach(log => console.log(log));
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
  deleted: number;
  regionCode: string;
  error?: string;
}> {
  try {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    // toISOString()은 UTC로 변환되므로 직접 포맷팅
    const year = threeMonthsAgo.getFullYear();
    const month = String(threeMonthsAgo.getMonth() + 1).padStart(2, '0');
    const day = String(threeMonthsAgo.getDate()).padStart(2, '0');
    const threeMonthsAgoStr = `${year}-${month}-${day}`;

    console.log(`[${regionCode}] 처리 시작...`);

    // 1. DB에서 최근 3개월 데이터 조회 (어제까지의 상태)
    const yesterday = await loadDbTransactions(regionCode, threeMonthsAgoStr);

    // 2. 오늘 API 조회
    const today = await fetchApiForRecentMonths(regionCode, 3, now);

    console.log(
      `[${regionCode}] 조회 완료 - DB: ${yesterday.length}건, API: ${today.length}건`
    );

    // 3. Diff (1:1 매칭) - id 제외하고 비교
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const yesterdayWithoutId = yesterday.map(({ _dbId, ...rest }) => ({
      ...rest,
      apart_id: null, // 비교 시 apart_id 무시 (배치에서는 매핑 안 함)
    }));

    const { yesterdayRemaining, todayRemaining } = removeExactMatches(
      yesterdayWithoutId,
      today
    );

    console.log(
      `[${regionCode}] Diff 후 - DB 남음: ${yesterdayRemaining.length}건, API 남음: ${todayRemaining.length}건`
    );

    // 4. DB id 매핑 (yesterdayRemaining을 원본 yesterday에서 id 찾기)
    const yesterdayWithIds = yesterdayRemaining.map(yRow => {
      const original = yesterday.find(y => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _dbId, ...rest } = y;
        return (
          JSON.stringify({ ...rest, apart_id: null }) === JSON.stringify(yRow)
        );
      });
      return {
        ...yRow,
        _dbId: original?._dbId,
      };
    });

    // 5. Key 기반 매칭
    const { toUpdate, toDelete, toInsert } = matchByKey(
      yesterdayWithIds,
      todayRemaining
    );

    console.log(
      `[${regionCode}] 매칭 결과 - UPDATE: ${toUpdate.length}건, DELETE: ${toDelete.length}건, INSERT: ${toInsert.length}건`
    );

    // 6. DB 작업 실행
    const deleted = await deleteTransactions(toDelete);
    const { updated, inserted } = await updateAndInsertTransactions(
      toUpdate,
      toInsert
    );

    console.log(
      `[${regionCode}] ✅ 완료 - UPDATE: ${updated}건, DELETE: ${deleted}건, INSERT: ${inserted}건`
    );

    return { success: true, updated, inserted, deleted, regionCode };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[${regionCode}] ❌ 처리 실패:`, errorMessage);
    return {
      success: false,
      updated: 0,
      inserted: 0,
      deleted: 0,
      regionCode,
      error: errorMessage,
    };
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
    deleted: number;
    regionCode: string;
    error?: string;
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
  const totalDeleted = results.reduce((sum, r) => sum + r.deleted, 0);
  const totalInserted = results.reduce((sum, r) => sum + r.inserted, 0);

  console.log('\n' + '='.repeat(60));
  console.log('✨ Daily sync completed');
  console.log(`완료 시각: ${new Date().toLocaleString('ko-KR')}`);
  console.log(`✅ 성공: ${successCount}/${regionCodes.length} 지역`);
  if (failCount > 0) {
    console.log(`❌ 실패: ${failCount}/${regionCodes.length} 지역`);
  }
  console.log(`📝 총 업데이트: ${totalUpdated}건`);
  console.log(`🗑️  총 삭제: ${totalDeleted}건`);
  console.log(`➕ 총 신규 등록: ${totalInserted}건`);

  // 실패한 지역 상세 출력
  if (failCount > 0) {
    const errors = results
      .filter(r => !r.success)
      .map(r => ({
        regionCode: r.regionCode,
        error: r.error || 'Unknown error',
      }));

    console.log('\n❌ 실패한 지역:');
    errors.forEach(({ regionCode, error }) => {
      console.log(`  - [${regionCode}] ${error}`);
    });
  }

  console.log('='.repeat(60));

  // DB 연결 종료
  const pool = getDbPool();
  await pool.end();
  console.log('\n🔌 DB 연결 종료');
}

main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
