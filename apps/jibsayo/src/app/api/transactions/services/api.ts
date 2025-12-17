import { query } from '@/app/api/shared/libs/database';
import { createFallbackToken } from '@/app/api/shared/services/transaction/service';
import { calculateAreaPyeong } from '@/entities/transaction/services/calculator';

import {
  DbTransactionRow,
  FetchTransactionListParams,
  FetchTransactionListResponse,
} from '../types';

const buildWhereConditions = (
  regionCode: string,
  startDate: string,
  endDate: string,
  filter: FetchTransactionListParams['filter']
): { conditions: string[]; params: (string | number)[] } => {
  const conditions: string[] = [
    't.region_code = ?',
    't.deal_date >= ?',
    't.deal_date < ?',
    // "t.cancellation_type != 'CANCELED'",
  ];
  const params: (string | number)[] = [regionCode, startDate, endDate];

  if (filter.apartName) {
    conditions.push('t.apart_name LIKE ?');
    params.push(`%${filter.apartName}%`);
  }

  if (filter.minSize !== undefined) {
    conditions.push('t.exclusive_area >= ?');
    params.push(filter.minSize);
  }

  if (filter.maxSize !== undefined) {
    conditions.push('t.exclusive_area <= ?');
    params.push(filter.maxSize);
  }

  if (filter.newTransactionOnly) {
    conditions.push('DATE(t.created_at) = CURDATE()');
  }

  return { conditions, params };
};

const buildOrderByClause = (
  sort: FetchTransactionListParams['sort']
): string => {
  if (!sort.orderBy) {
    return 'ORDER BY t.deal_date DESC';
  }

  const orderByColumn =
    sort.orderBy === 'dealDate' ? 't.deal_date' : 't.deal_amount';
  const orderDirection = sort.orderDirection || 'desc';

  return `ORDER BY ${orderByColumn} ${orderDirection.toUpperCase()}`;
};

const fetchTotalCount = async (
  whereConditions: string[],
  queryParams: (string | number)[]
): Promise<number> => {
  const countSql = `
    SELECT COUNT(*) as totalCount
    FROM transactions t
    WHERE ${whereConditions.join(' AND ')}
  `;

  const countResult = await query<{ totalCount: number }[]>(
    countSql,
    queryParams
  );

  return countResult[0]?.totalCount || 0;
};

const fetchTransactions = async (
  whereConditions: string[],
  queryParams: (string | number)[],
  orderByClause: string,
  pageSize: number,
  offset: number
): Promise<DbTransactionRow[]> => {
  const dataSql = `
    SELECT
      t.id,
      t.region_code as regionCode,
      t.deal_date as dealDate,
      t.deal_amount as dealAmount,
      t.exclusive_area as size,
      t.floor,
      t.apart_id as apartId,
      a.apart_name as apartName,
      a.jibun,
      a.dong as dong,
      a.completion_year as buildedYear,
      a.total_household_count as householdCount,
      DATE(t.created_at) = CURDATE() as isNewTransaction
    FROM transactions t
    LEFT JOIN apartments a ON t.apart_id = a.id
    WHERE ${whereConditions.join(' AND ')}
    ${orderByClause}
    LIMIT ? OFFSET ?
  `;

  const dataParams = [...queryParams, pageSize, offset];

  const rows = await query<
    Array<
      Omit<DbTransactionRow, 'fallbackToken' | 'isNewTransaction'> & {
        isNewTransaction: number;
      }
    >
  >(dataSql, dataParams);

  return rows.map(row => ({
    ...row,
    isNewTransaction: Boolean(row.isNewTransaction),
    dealAmount: row.dealAmount * 10000,
    fallbackToken: createFallbackToken({
      regionCode: row.regionCode,
      apartName: row.apartName,
    }),
  }));
};

const fetchAveragePricePerPyeong = async (
  whereConditions: string[],
  queryParams: (string | number)[]
): Promise<number> => {
  const sql = `
    SELECT t.exclusive_area, t.deal_amount
    FROM transactions t
    WHERE ${whereConditions.join(' AND ')}
  `;

  const rows = await query<{ exclusive_area: number; deal_amount: number }[]>(
    sql,
    queryParams
  );

  if (rows.length === 0) return 0;

  const totalPricePerPyeong = rows.reduce((sum, row) => {
    const pyeong = calculateAreaPyeong(row.exclusive_area);
    const pricePerPyeong = pyeong > 0 ? (row.deal_amount * 10000) / pyeong : 0;
    return sum + pricePerPyeong;
  }, 0);

  return Math.round(totalPricePerPyeong / rows.length);
};

export const fetchTransactionList = async ({
  regionCode,
  dealPeriod,
  pageIndex,
  pageSize,
  filter,
  sort,
}: FetchTransactionListParams): Promise<FetchTransactionListResponse> => {
  // dealPeriod를 날짜 범위로 변환 (예: "202510" => "2025-10-01" ~ "2025-11-01")
  const year = dealPeriod.substring(0, 4);
  const month = dealPeriod.substring(4, 6);
  const startDate = `${year}-${month}-01`;

  // 다음 달의 첫날 계산 (해당 월의 마지막 날짜를 포함하기 위해)
  const nextMonth = new Date(parseInt(year), parseInt(month), 1);
  const endDate = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-${String(nextMonth.getDate()).padStart(2, '0')}`;

  // offset 계산
  const offset = pageIndex * pageSize;

  // WHERE 조건 동적 구성
  const { conditions: whereConditions, params: queryParams } =
    buildWhereConditions(regionCode, startDate, endDate, filter);

  // ORDER BY 절 동적 구성
  const orderByClause = buildOrderByClause(sort);

  // 전체 개수 조회 (페이지네이션 적용 전)
  const totalCount = await fetchTotalCount(whereConditions, queryParams);

  // 페이지네이션 적용된 데이터 조회
  const transactions = await fetchTransactions(
    whereConditions,
    queryParams,
    orderByClause,
    pageSize,
    offset
  );

  // 평균 평단가 계산
  const averagePricePerPyeong = await fetchAveragePricePerPyeong(
    whereConditions,
    queryParams
  );

  return { totalCount, transactions, averagePricePerPyeong };
};
