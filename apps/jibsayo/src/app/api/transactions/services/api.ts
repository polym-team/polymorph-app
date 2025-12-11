import { query } from '@/app/api/shared/libs/database';

import { DbTransactionRow, FetchTransactionListParams } from '../types';

export const fetchTransactionList = async ({
  regionCode,
  dealPeriod,
  pageIndex,
  pageSize,
}: FetchTransactionListParams): Promise<DbTransactionRow[]> => {
  // dealPeriod를 날짜 범위로 변환 (예: "202510" => "2025-10-01" ~ "2025-11-01")
  const year = dealPeriod.substring(0, 4);
  const month = dealPeriod.substring(4, 6);
  const startDate = `${year}-${month}-01`;

  // 다음 달의 첫날 계산 (해당 월의 마지막 날짜를 포함하기 위해)
  const nextMonth = new Date(parseInt(year), parseInt(month), 1);
  const endDate = nextMonth.toISOString().split('T')[0];

  // offset 계산
  const offset = pageIndex * pageSize;

  // SQL 쿼리 실행
  const sql = `
    SELECT
      t.id,
      t.apart_name as apartName,
      t.deal_date as tradeDate,
      t.deal_amount as tradeAmount,
      t.exclusive_area as size,
      t.floor,
      t.apart_id as apartId,
      a.dong as dong,
      a.completion_year as buildedYear,
      a.total_household_count as householdCount
    FROM transactions t
    LEFT JOIN apartments a ON t.apart_id = a.id
    WHERE t.region_code = ?
      AND t.deal_date >= ?
      AND t.deal_date < ?
    ORDER BY t.deal_date DESC
    LIMIT ? OFFSET ?
  `;

  const rows = await query<DbTransactionRow[]>(sql, [
    regionCode,
    startDate,
    endDate,
    pageSize,
    offset,
  ]);

  return rows;
};
