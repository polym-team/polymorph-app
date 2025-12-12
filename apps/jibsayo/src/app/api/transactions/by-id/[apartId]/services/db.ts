import { query } from '@/app/api/shared/libs/database';

import {
  DbTransactionRow,
  OrderBy,
  OrderDirection,
  PageIndexes,
} from '../types';

export const buildWhereConditions = ({
  apartId,
  period,
  sizes,
}: {
  apartId: number;
  period?: number;
  sizes?: [number, number][];
}): { whereConditions: string[]; queryParams: (string | number)[] } => {
  const whereConditions = ['apart_id = ?'];
  const queryParams: (string | number)[] = [apartId];

  if (period) {
    whereConditions.push('deal_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)');
    queryParams.push(period);
  }

  if (sizes && sizes.length > 0) {
    const sizeConditions = sizes
      .map(() => 'exclusive_area BETWEEN ? AND ?')
      .join(' OR ');
    whereConditions.push(`(${sizeConditions})`);

    sizes.forEach(([min, max]) => {
      queryParams.push(min, max);
    });
  }

  return { whereConditions, queryParams };
};

export const getTransactionTotalCountByApartId = async (
  whereConditions: string[],
  queryParams: (string | number)[]
): Promise<number> => {
  const sql = `
    SELECT COUNT(*) as totalCount
    FROM transactions
    WHERE ${whereConditions.join(' AND ')}
  `;

  const result = await query<{ totalCount: number }[]>(sql, queryParams);
  const totalCount = result[0]?.totalCount ?? 0;

  return totalCount;
};

export const getTransactionsByApartId = async ({
  whereConditions,
  queryParams,
  pageIndex,
  pageSize,
  orderBy = 'dealDate',
  orderDirection = 'desc',
}: {
  whereConditions: string[];
  queryParams: (string | number)[];
  pageIndex: number;
  pageSize: number;
  orderBy?: OrderBy;
  orderDirection?: OrderDirection;
}): Promise<DbTransactionRow[]> => {
  const offset = pageIndex * pageSize;

  const orderByColumn = orderBy === 'dealDate' ? 'deal_date' : 'deal_amount';
  const finalOrderDirection = orderDirection || 'desc';
  const orderByClause = `ORDER BY ${orderByColumn} ${finalOrderDirection.toUpperCase()}`;

  const sql = `
    SELECT
    t.id,
      t.deal_date as dealDate,
      t.exclusive_area as size,
      t.floor,
      t.deal_amount as dealAmount,
      DATE(t.created_at) = CURDATE() as isNewTransaction,
      (
        SELECT JSON_OBJECT(
          'id', pt.id,
          'dealDate', deal_date,
          'size', exclusive_area,
          'floor', floor,
          'dealAmount', deal_amount
        )
        FROM transactions pt
        WHERE pt.apart_id = t.apart_id
          AND pt.exclusive_area = t.exclusive_area
          AND pt.deal_date < t.deal_date
        ORDER BY pt.deal_date DESC
        LIMIT 1
      ) as prevTransaction
    FROM transactions t
    WHERE ${whereConditions.join(' AND ')}
    ${orderByClause}
    LIMIT ? OFFSET ?
  `;

  const rows = await query<
    Array<
      Omit<DbTransactionRow, 'prevTransaction'> & {
        prevTransaction: string | null;
      }
    >
  >(sql, [...queryParams, pageSize, offset]);

  return rows;
};

export const getPageIndexesByYear = async ({
  whereConditions,
  queryParams,
  pageSize,
  orderBy = 'dealDate',
  orderDirection = 'desc',
}: {
  whereConditions: string[];
  queryParams: (string | number)[];
  pageSize: number;
  orderBy?: OrderBy;
  orderDirection?: OrderDirection;
}): Promise<PageIndexes> => {
  const orderByColumn = orderBy === 'dealDate' ? 'deal_date' : 'deal_amount';
  const finalOrderDirection = orderDirection || 'desc';

  const sql = `
    WITH numbered_transactions AS (
      SELECT
        YEAR(deal_date) as year,
        ROW_NUMBER() OVER (ORDER BY ${orderByColumn} ${finalOrderDirection.toUpperCase()}) as row_num
      FROM transactions
      WHERE ${whereConditions.join(' AND ')}
    )
    SELECT
      year,
      FLOOR((MIN(row_num) - 1) / ?) as page_index,
      COUNT(*) as count
    FROM numbered_transactions
    GROUP BY year
    ORDER BY year DESC
  `;

  const rows = await query<
    Array<{ year: number; page_index: number; count: number }>
  >(sql, [...queryParams, pageSize]);

  return rows.map((row) => ({
    year: row.year,
    index: row.page_index,
    count: Number(row.count),
  }));
};
