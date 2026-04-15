import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

import { getDbPool, query } from '../src/app/api/shared/libs/database-legacy';
import { fetchGovApiData } from '../src/app/api/transactions/services/legacy-api';
import { GovApiItem } from '../src/app/api/transactions/types';
import regionCodesData from '../src/entities/region/models/codes.json';

// .env.local 파일 로드 (로컬 실행 시)
dotenv.config({ path: '.env.local' });

const REGION_BATCH_SIZE = 10;

// ============================================================
// Apartment Code 생성
// ============================================================

function generateApartmentCode(
  regionCode: string,
  apartName: string,
  jibun: string | null,
  dong: string | null,
  completionYear: number | null
): string {
  const str = `${regionCode}_${apartName}_${jibun || ''}_${dong || ''}_${completionYear || ''}`;
  return crypto.createHash('md5').update(str).digest('hex').substring(0, 16);
}

// ============================================================
// 타입 정의
// ============================================================

interface TransactionDbRow {
  region_code: string;
  apart_id: number | null;
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
// Apartments 조회
// ============================================================

interface ApartmentInfo {
  id: number;
  apart_name: string;
  jibun: string | null;
  dong: string | null;
  completion_year: number | null;
}

// 복합 키 생성 함수 (아파트 찾기용)
function createApartmentKey(
  regionCode: string,
  apartName: string,
  jibun: string | null,
  dong: string | null,
  completionYear: number | null
): string {
  return `${regionCode}|${apartName}|${jibun || ''}|${dong || ''}|${completionYear || ''}`;
}

// 지역의 모든 아파트 정보 조회
async function loadApartmentsForRegion(
  regionCode: string
): Promise<Map<string, number>> {
  const apartments = await query<ApartmentInfo[]>(
    `
    SELECT id, apart_name, jibun, dong, completion_year
    FROM apartments
    WHERE region_code = ?
  `,
    [regionCode]
  );

  // 복합 키 (regionCode|name|jibun|dong|year)를 키로 하는 Map 생성
  const apartmentMap = new Map<string, number>();
  for (const apt of apartments) {
    const key = createApartmentKey(
      regionCode,
      apt.apart_name,
      apt.jibun,
      apt.dong,
      apt.completion_year
    );
    apartmentMap.set(key, apt.id);
  }

  return apartmentMap;
}

// 아파트 찾기 또는 생성
async function findOrCreateApartment(
  regionCode: string,
  apartName: string,
  jibun: string | null,
  dong: string | null,
  completionYear: number | null,
  apartmentsMap: Map<string, number>
): Promise<number> {
  // 1. 캐시에서 복합 키로 먼저 확인
  const apartKey = createApartmentKey(
    regionCode,
    apartName,
    jibun,
    dong,
    completionYear
  );
  const cachedId = apartmentsMap.get(apartKey);
  if (cachedId) {
    return cachedId;
  }

  // 2. DB에서 확인 (캐시 미스) - 복합 조건으로 검색
  const existing = await query<{ id: number }[]>(
    `
    SELECT id FROM apartments
    WHERE region_code = ?
      AND apart_name = ?
      AND (jibun = ? OR (jibun IS NULL AND ? IS NULL))
      AND (dong = ? OR (dong IS NULL AND ? IS NULL))
      AND (completion_year = ? OR (completion_year IS NULL AND ? IS NULL))
    `,
    [
      regionCode,
      apartName,
      jibun,
      jibun,
      dong,
      dong,
      completionYear,
      completionYear,
    ]
  );

  if (existing.length > 0) {
    const apartId = existing[0].id;
    apartmentsMap.set(apartKey, apartId);
    return apartId;
  }

  // 3. 새로 생성 (이때만 apart_code 생성)
  const apartCode = generateApartmentCode(
    regionCode,
    apartName,
    jibun,
    dong,
    completionYear
  );

  const result = await query<{ insertId: number }>(
    `
    INSERT INTO apartments (
      region_code, apart_code, apart_name, completion_year, dong, jibun
    ) VALUES (?, ?, ?, ?, ?, ?)
  `,
    [regionCode, apartCode, apartName, completionYear, dong, jibun]
  );

  const newApartId = result.insertId;
  apartmentsMap.set(apartKey, newApartId);

  return newApartId;
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
async function convertGovApiItemToDbRow(
  item: GovApiItem,
  regionCode: string,
  apartmentsMap: Map<string, number>
): Promise<TransactionDbRow> {
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

  // 아파트 정보 추출
  const apartName = item.aptNm || '';
  const jibun = item.jibun || null;
  const dong = item.umdNm || null;
  const completionYear = item.buildYear ? parseInt(item.buildYear) : null;

  // 아파트 찾기 또는 생성
  const apartId = await findOrCreateApartment(
    regionCode,
    apartName,
    jibun,
    dong,
    completionYear,
    apartmentsMap
  );

  return {
    region_code: regionCode,
    apart_id: apartId,
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
  return `${row.region_code}|${row.apart_id || ''}|${row.deal_date}|${row.deal_amount}|${row.exclusive_area}|${row.floor || ''}`;
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
// INSERT 시점의 타입과 일치하도록 필요한 필드만 타입 변환
function convertDbRowToTransactionWithId(dbRow: any): TransactionWithId {
  return {
    region_code: dbRow.region_code,
    apart_id: dbRow.apart_id,
    deal_date: dbRow.deal_date,
    deal_amount: dbRow.deal_amount,
    // DECIMAL 타입은 mysql2가 string으로 반환하므로 number로 변환
    exclusive_area:
      dbRow.exclusive_area !== null ? parseFloat(dbRow.exclusive_area) : null,
    floor: dbRow.floor,
    building_dong: dbRow.building_dong,
    estate_agent_region: dbRow.estate_agent_region,
    registration_date: dbRow.registration_date,
    cancellation_type: dbRow.cancellation_type,
    cancellation_date: dbRow.cancellation_date,
    deal_type: dbRow.deal_type,
    seller_type: dbRow.seller_type,
    buyer_type: dbRow.buyer_type,
    // BOOLEAN 타입은 0/1로 반환되므로 boolean으로 변환
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
  // 1. API 데이터를 키별로 그룹화
  const apiByKey = new Map<string, TransactionDbRow[]>();
  for (const apiRow of apiRemaining) {
    const key = createUniqueKey(apiRow);
    if (!apiByKey.has(key)) {
      apiByKey.set(key, []);
    }
    apiByKey.get(key)!.push(apiRow);
  }

  // 2. DB 데이터를 키별로 그룹화
  const dbByKey = new Map<string, TransactionWithId[]>();
  for (const dbRow of dbRemaining) {
    const key = createUniqueKey(dbRow);
    if (!dbByKey.has(key)) {
      dbByKey.set(key, []);
    }
    dbByKey.get(key)!.push(dbRow);
  }

  const toUpdate: Array<{
    dbRow: TransactionWithId;
    newRow: TransactionDbRow;
  }> = [];
  const toDelete: TransactionWithId[] = [];
  const toInsert: TransactionDbRow[] = [];

  // 3. 모든 고유 키에 대해 개수 일치 여부로 분기 처리
  const allKeys = new Set([...apiByKey.keys(), ...dbByKey.keys()]);

  for (const key of allKeys) {
    const apiMatches = apiByKey.get(key) || [];
    const dbMatches = dbByKey.get(key) || [];

    if (dbMatches.length === apiMatches.length) {
      // 3.1. 개수 일치: 순서대로 1:1 UPDATE
      for (let i = 0; i < dbMatches.length; i++) {
        toUpdate.push({
          dbRow: dbMatches[i],
          newRow: apiMatches[i],
        });
      }
    } else {
      // 3.2. 개수 불일치: 모두 DELETE 후 모두 INSERT
      for (const dbRow of dbMatches) {
        toDelete.push(dbRow);
      }
      for (const apiRow of apiMatches) {
        toInsert.push(apiRow);
      }
    }
  }

  return { toUpdate, toDelete, toInsert };
}

// DELETE 처리
async function deleteTransactions(
  toDelete: TransactionWithId[]
): Promise<{ deleted: number; logs: string[] }> {
  let deleted = 0;
  const deletesLog: string[] = [];

  for (const dbRow of toDelete) {
    if (dbRow._dbId) {
      deletesLog.push(
        `ApartID: ${dbRow.apart_id} | ${dbRow.deal_date} | ${dbRow.deal_amount}만원`
      );

      await query(`DELETE FROM transactions WHERE id = ?`, [dbRow._dbId]);

      deleted++;
    }
  }

  return { deleted, logs: deletesLog };
}

// UPDATE/INSERT 처리
async function updateAndInsertTransactions(
  toUpdate: Array<{ dbRow: TransactionWithId; newRow: TransactionDbRow }>,
  toInsert: TransactionDbRow[]
): Promise<{
  updated: number;
  inserted: number;
  updateLogs: string[];
  insertLogs: string[];
}> {
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

      // 변경사항이 없으면 UPDATE 스킵
      if (changes.length === 0) {
        continue;
      }

      updatesLog.push(
        `[UPDATE #${dbRow._dbId}] ApartID: ${newRow.apart_id} | ${newRow.deal_date} | ${newRow.deal_amount}만원\n  변경사항: ${changes.join(', ')}`
      );

      await query(
        `
        UPDATE transactions SET
          region_code = ?,
          apart_id = ?,
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
      `[INSERT] ApartID: ${newRow.apart_id} | ${newRow.deal_date} | ${newRow.deal_amount}만원 | ${newRow.exclusive_area}㎡ | ${newRow.floor}층`
    );

    await query(
      `
      INSERT INTO transactions (
        region_code, apart_id, deal_date, deal_amount,
        exclusive_area, floor, building_dong,
        estate_agent_region, registration_date,
        cancellation_type, cancellation_date,
        deal_type, seller_type, buyer_type, is_land_lease,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
      [
        newRow.region_code,
        newRow.apart_id,
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

  return {
    updated,
    inserted,
    updateLogs: updatesLog,
    insertLogs: insertsLog,
  };
}

// API 조회 (최근 N개월)
async function fetchApiForRecentMonths(
  regionCode: string,
  monthCount: number,
  baseDate: Date,
  apartmentsMap: Map<string, number>
): Promise<TransactionDbRow[]> {
  const allRows: TransactionDbRow[] = [];
  const errors: string[] = [];

  for (let i = 0; i < monthCount; i++) {
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const yearMonth = `${year}${month}`;

    try {
      const govApiItems = await fetchGovApiData(regionCode, yearMonth);
      const rows = await Promise.all(
        govApiItems.map(item =>
          convertGovApiItemToDbRow(item, regionCode, apartmentsMap)
        )
      );
      allRows.push(...rows);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(
        `[${regionCode}] ${yearMonth} API 조회 실패:`,
        errorMessage
      );
      errors.push(`${yearMonth}: ${errorMessage}`);
    }
  }

  // API 조회가 하나라도 실패하면 에러 throw하여 해당 지역 처리 중단
  if (errors.length > 0) {
    throw new Error(
      `API 조회 실패 (${errors.length}/${monthCount}개월): ${errors.join(', ')}`
    );
  }

  return allRows;
}

// 지역별 처리
async function processRegion(regionCode: string): Promise<{
  success: boolean;
  updated: number;
  inserted: number;
  deleted: number;
  newApartmentsCount: number;
  newApartmentNames: string[];
  deleteLogs: string[];
  updateLogs: string[];
  insertLogs: string[];
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

    // 0. Apartments 캐시 생성
    const apartmentsMap = await loadApartmentsForRegion(regionCode);
    const initialApartmentCount = apartmentsMap.size;
    console.log(
      `[${regionCode}] Apartments 캐시 생성 완료: ${initialApartmentCount}개`
    );

    // 1. DB에서 최근 3개월 데이터 조회 (어제까지의 상태)
    const yesterday = await loadDbTransactions(regionCode, threeMonthsAgoStr);

    // 2. 오늘 API 조회
    const today = await fetchApiForRecentMonths(
      regionCode,
      3,
      now,
      apartmentsMap
    );

    console.log(
      `[${regionCode}] 조회 완료 - DB: ${yesterday.length}건, API: ${today.length}건`
    );

    // 3. Diff (1:1 매칭) - id 제외하고 비교
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const yesterdayWithoutId = yesterday.map(({ _dbId, ...rest }) => ({
      ...rest,
    }));

    const { yesterdayRemaining, todayRemaining } = removeExactMatches(
      yesterdayWithoutId,
      today
    );

    console.log(
      `[${regionCode}] Diff 후 - DB 남음: ${yesterdayRemaining.length}건, API 남음: ${todayRemaining.length}건`
    );

    // 4. DB id 매핑 (yesterdayRemaining을 원본 yesterday에서 id 찾기)
    const usedOriginals = new Set<number>();
    const yesterdayWithIds = yesterdayRemaining.map(yRow => {
      const original = yesterday.find(y => {
        // 이미 사용된 원본은 스킵
        if (y._dbId && usedOriginals.has(y._dbId)) {
          return false;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _dbId, ...rest } = y;
        return JSON.stringify(rest) === JSON.stringify(yRow);
      });

      if (original?._dbId) {
        usedOriginals.add(original._dbId);
      }

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

    // 6. 초기 아파트 키 저장 (신규 아파트 추적용)
    const initialApartmentKeys = new Set(apartmentsMap.keys());

    // 7. DB 작업 실행
    const { deleted, logs: deleteLogs } = await deleteTransactions(toDelete);
    const { updated, inserted, updateLogs, insertLogs } =
      await updateAndInsertTransactions(toUpdate, toInsert);

    // 8. 새로 생성된 아파트 수 계산 및 목록 추출
    const newApartmentKeys = [...apartmentsMap.keys()].filter(
      key => !initialApartmentKeys.has(key)
    );
    const newApartmentNames = newApartmentKeys.map(key => {
      // 키 형식: "regionCode|apartName|jibun|dong|year"
      const parts = key.split('|');
      return parts[1]; // apartName
    });
    const newApartmentsCount = newApartmentNames.length;

    console.log(
      `[${regionCode}] ✅ 완료 - UPDATE: ${updated}건, DELETE: ${deleted}건, INSERT: ${inserted}건, 신규 아파트: ${newApartmentsCount}개`
    );

    return {
      success: true,
      updated,
      inserted,
      deleted,
      newApartmentsCount,
      newApartmentNames,
      deleteLogs,
      updateLogs,
      insertLogs,
      regionCode,
    };
  } catch (error) {
    // 에러 전체 출력
    console.error(`[${regionCode}] ❌ 처리 실패 - 에러 전체:`, error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error(
      `[${regionCode}] 에러 메시지:`,
      errorMessage || '(빈 메시지)'
    );
    if (errorStack) {
      console.error(`[${regionCode}] 스택 트레이스:`, errorStack);
    }

    return {
      success: false,
      updated: 0,
      inserted: 0,
      deleted: 0,
      newApartmentsCount: 0,
      newApartmentNames: [],
      deleteLogs: [],
      updateLogs: [],
      insertLogs: [],
      regionCode,
      error: errorMessage || 'Unknown error',
    };
  }
}

// 메인 함수
async function main(): Promise<void> {
  console.log('🚀 Daily sync started');
  console.log(`시작 시각: ${new Date().toLocaleString('ko-KR')}`);
  console.log('='.repeat(60));

  // 지역 코드와 이름 매핑 생성
  const regionCodeMap = new Map<string, string>();
  regionCodesData.forEach(region => {
    region.children.forEach(child => {
      regionCodeMap.set(child.code, `${region.name} ${child.name}`);
    });
  });

  // 전체 지역
  const regionCodes = regionCodesData.flatMap(region =>
    region.children.map(child => child.code)
  );

  console.log(`처리할 지역 수: ${regionCodes.length}개\n`);

  const results: {
    success: boolean;
    updated: number;
    inserted: number;
    deleted: number;
    newApartmentsCount: number;
    newApartmentNames: string[];
    deleteLogs: string[];
    updateLogs: string[];
    insertLogs: string[];
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
  const totalNewApartments = results.reduce(
    (sum, r) => sum + r.newApartmentsCount,
    0
  );

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
  console.log(`🏢 총 신규 아파트: ${totalNewApartments}개`);

  // 지역별 상세 결과 출력
  console.log('\n' + '='.repeat(60));
  console.log('📊 지역별 상세 결과:');
  console.log('='.repeat(60));

  // 성공한 지역만 필터링하고 INSERT+UPDATE+DELETE+신규아파트 건수가 있는 지역만 출력
  const successResults = results.filter(
    r =>
      r.success &&
      (r.inserted > 0 ||
        r.updated > 0 ||
        r.deleted > 0 ||
        r.newApartmentsCount > 0)
  );

  if (successResults.length > 0) {
    successResults.forEach(result => {
      const regionName = regionCodeMap.get(result.regionCode) || '알 수 없음';

      console.log(`\n# ${regionName}(${result.regionCode})`);

      // 신규 아파트
      if (result.newApartmentNames.length > 0) {
        console.log('\n## NEW APARTMENT');
        result.newApartmentNames.forEach(name => {
          console.log(`- ${name}`);
        });
      }

      // INSERT
      if (result.inserted > 0) {
        console.log(`\n## INSERT: ${result.inserted}건`);
        result.insertLogs.forEach(log => {
          console.log(`- ${log}`);
        });
      }

      // DELETE
      if (result.deleted > 0) {
        console.log(`\n## DELETE: ${result.deleted}건`);
        result.deleteLogs.forEach(log => {
          console.log(`- ${log}`);
        });
      }

      // UPDATE
      if (result.updated > 0) {
        console.log(`\n## UPDATE: ${result.updated}건`);
        result.updateLogs.forEach(log => {
          console.log(`- ${log}`);
        });
      }
    });
  } else {
    console.log('변경사항이 있는 지역이 없습니다.');
  }

  // 실패한 지역 상세 출력
  if (failCount > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ 실패한 지역:');
    console.log('='.repeat(60));

    const errors = results
      .filter(r => !r.success)
      .map(r => ({
        regionCode: r.regionCode,
        regionName: regionCodeMap.get(r.regionCode) || '알 수 없음',
        error: r.error || 'Unknown error',
      }));

    errors.forEach(({ regionCode, regionName, error }) => {
      console.log(`- [${regionCode}] ${regionName}: ${error}`);
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
