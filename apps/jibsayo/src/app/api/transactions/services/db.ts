import { query } from '@/app/api/shared/libs/database';
import { createFallbackToken } from '@/app/api/shared/services/transaction/service';

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
    "t.cancellation_type != 'CANCELED'",
  ];
  const params: (string | number)[] = [regionCode, startDate, endDate];

  if (filter.apartName) {
    conditions.push('a.apart_name LIKE ?');
    params.push(`%${filter.apartName}%`);
  }

  if (filter.minDealAmount !== undefined && isFinite(filter.minDealAmount)) {
    conditions.push('t.deal_amount >= ?');
    params.push(filter.minDealAmount / 10000);
  }

  if (filter.maxDealAmount !== undefined && isFinite(filter.maxDealAmount)) {
    conditions.push('t.deal_amount <= ?');
    params.push(filter.maxDealAmount / 10000);
  }

  if (filter.minHouseholdCount !== undefined && isFinite(filter.minHouseholdCount)) {
    conditions.push('a.total_household_count >= ?');
    params.push(filter.minHouseholdCount);
  }

  if (filter.maxHouseholdCount !== undefined && isFinite(filter.maxHouseholdCount)) {
    conditions.push('a.total_household_count <= ?');
    params.push(filter.maxHouseholdCount);
  }

  if (filter.minSize !== undefined && isFinite(filter.minSize)) {
    conditions.push('t.exclusive_area >= ?');
    params.push(filter.minSize);
  }

  if (filter.maxSize !== undefined && isFinite(filter.maxSize)) {
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

  const buildOrderByColumn = (): string => {
    if (!sort.orderBy || sort.orderBy === 'dealDate') {
      return 't.deal_date';
    }
    if (sort.orderBy === 'dealAmount') {
      return 't.deal_amount';
    }
    if (sort.orderBy === 'floor') {
      return 't.floor';
    }
    if (sort.orderBy === 'size') {
      return 't.exclusive_area';
    }
    if (sort.orderBy === 'apartName') {
      return 'a.apart_name';
    }
    const _exhaustiveCheck: never = sort.orderBy;
    return _exhaustiveCheck;
  };

  const orderByColumn = buildOrderByColumn();
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
    LEFT JOIN apartments a ON t.apart_id = a.id
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
      a.completion_year as completionYear,
      DATE(t.created_at) = CURDATE() as isNewTransaction,
      highest.deal_amount as highestDealAmount,
      highest.deal_date as highestDealDate,
      highest.exclusive_area as highestDealSize,
      highest.floor as highestDealFloor,
      lowest.deal_amount as lowestDealAmount,
      lowest.deal_date as lowestDealDate,
      lowest.exclusive_area as lowestDealSize,
      lowest.floor as lowestDealFloor
    FROM transactions t
    LEFT JOIN apartments a ON t.apart_id = a.id
    LEFT JOIN (
      SELECT
        t1.apart_id,
        t1.exclusive_area,
        t1.deal_amount,
        t1.deal_date,
        t1.floor
      FROM transactions t1
      INNER JOIN (
        SELECT
          apart_id,
          exclusive_area,
          MAX(deal_amount) as max_amount
        FROM transactions
        WHERE cancellation_type != 'CANCELED'
        GROUP BY apart_id, exclusive_area
      ) t2 ON t1.apart_id = t2.apart_id
        AND t1.exclusive_area = t2.exclusive_area
        AND t1.deal_amount = t2.max_amount
      WHERE t1.cancellation_type != 'CANCELED'
    ) highest ON t.apart_id = highest.apart_id AND t.exclusive_area = highest.exclusive_area
    LEFT JOIN (
      SELECT
        t1.apart_id,
        t1.exclusive_area,
        t1.deal_amount,
        t1.deal_date,
        t1.floor
      FROM transactions t1
      INNER JOIN (
        SELECT
          apart_id,
          exclusive_area,
          MIN(deal_amount) as min_amount
        FROM transactions
        WHERE cancellation_type != 'CANCELED'
          AND deal_date >= DATE_SUB(CURDATE(), INTERVAL 5 YEAR)
        GROUP BY apart_id, exclusive_area
      ) t2 ON t1.apart_id = t2.apart_id
        AND t1.exclusive_area = t2.exclusive_area
        AND t1.deal_amount = t2.min_amount
      WHERE t1.cancellation_type != 'CANCELED'
        AND t1.deal_date >= DATE_SUB(CURDATE(), INTERVAL 5 YEAR)
    ) lowest ON t.apart_id = lowest.apart_id AND t.exclusive_area = lowest.exclusive_area
    WHERE ${whereConditions.join(' AND ')}
    GROUP BY t.id
    ${orderByClause}
    LIMIT ? OFFSET ?
  `;

  const dataParams = [...queryParams, pageSize, offset];

  const rows = await query<
    Array<
      Omit<
        DbTransactionRow,
        | 'fallbackToken'
        | 'isNewTransaction'
        | 'highestTransaction'
        | 'lowestTransaction'
      > & {
        isNewTransaction: number;
        highestDealAmount: number | null;
        highestDealDate: string | null;
        highestDealSize: number | null;
        highestDealFloor: number | null;
        lowestDealAmount: number | null;
        lowestDealDate: string | null;
        lowestDealSize: number | null;
        lowestDealFloor: number | null;
      }
    >
  >(dataSql, dataParams);

  return rows.map(row => {
    const {
      highestDealAmount,
      highestDealDate,
      highestDealSize,
      highestDealFloor,
      lowestDealAmount,
      lowestDealDate,
      lowestDealSize,
      lowestDealFloor,
      ...rest
    } = row;

    return {
      ...rest,
      isNewTransaction: Boolean(row.isNewTransaction),
      dealAmount: row.dealAmount * 10000,
      fallbackToken: createFallbackToken({
        regionCode: row.regionCode,
        apartName: row.apartName,
      }),
      highestTransaction:
        highestDealAmount !== null
          ? {
              dealAmount: highestDealAmount * 10000,
              dealDate: highestDealDate!,
              size: highestDealSize!,
              floor: highestDealFloor!,
            }
          : null,
      lowestTransaction:
        lowestDealAmount !== null
          ? {
              dealAmount: lowestDealAmount * 10000,
              dealDate: lowestDealDate!,
              size: lowestDealSize!,
              floor: lowestDealFloor!,
            }
          : null,
    };
  });
};

const fetchAveragePricePerPyeong = async (
  whereConditions: string[],
  queryParams: (string | number)[]
): Promise<number> => {
  const sql = `
    SELECT AVG(
      (t.deal_amount * 10000) /
      (
        CASE
          WHEN (t.exclusive_area * 0.3025) < 17 THEN ROUND((t.exclusive_area * 0.3025) * 1.4)
          WHEN (t.exclusive_area * 0.3025) < 20 THEN ROUND((t.exclusive_area * 0.3025) * 1.35)
          WHEN (t.exclusive_area * 0.3025) < 28 THEN ROUND((t.exclusive_area * 0.3025) * 1.35)
          WHEN (t.exclusive_area * 0.3025) < 35 THEN ROUND((t.exclusive_area * 0.3025) * 1.3)
          WHEN (t.exclusive_area * 0.3025) < 39 THEN ROUND((t.exclusive_area * 0.3025) * 1.23)
          ELSE ROUND((t.exclusive_area * 0.3025) * 1.22)
        END
      )
    ) as avgPricePerPyeong
    FROM transactions t
    LEFT JOIN apartments a ON t.apart_id = a.id
    WHERE ${whereConditions.join(' AND ')}
      AND t.exclusive_area > 0
  `;

  const result = await query<{ avgPricePerPyeong: number | null }[]>(
    sql,
    queryParams
  );

  return Math.round(result[0]?.avgPricePerPyeong || 0);
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
