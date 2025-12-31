import { query } from '@/app/api/shared/libs/database';
import { groupSizesByPyeong } from '@/app/api/shared/services/transaction/service';

import { DbMonthlyTransactionByIdsRow } from '../types';

export const getAvailableSizesByApartIds = async (
  apartIds: number[]
): Promise<Map<number, [number, number][]>> => {
  if (apartIds.length === 0) {
    return new Map();
  }

  const sql = `
    SELECT DISTINCT
      apart_id as apartId,
      exclusive_area
    FROM transactions
    WHERE apart_id IN (${apartIds.map(() => '?').join(', ')})
      AND exclusive_area IS NOT NULL
      AND cancellation_type != 'CANCELED'
    ORDER BY apart_id, exclusive_area
  `;

  const rows = await query<{ apartId: number; exclusive_area: number }[]>(
    sql,
    apartIds
  );

  const sizeMap = new Map<number, number[]>();
  rows.forEach(row => {
    if (!sizeMap.has(row.apartId)) {
      sizeMap.set(row.apartId, []);
    }
    sizeMap.get(row.apartId)!.push(row.exclusive_area);
  });

  const result = new Map<number, [number, number][]>();
  sizeMap.forEach((sizes, apartId) => {
    result.set(apartId, groupSizesByPyeong(sizes));
  });

  return result;
};

export const getMonthlyTransactionsByApartIds = async ({
  apartIds,
  period,
  sizesByApart,
}: {
  apartIds: number[];
  period?: number;
  sizesByApart?: Map<number, [number, number][]>;
}): Promise<DbMonthlyTransactionByIdsRow[]> => {
  if (apartIds.length === 0) {
    return [];
  }

  const whereConditions: string[] = [];
  const queryParams: (string | number)[] = [];

  if (sizesByApart && sizesByApart.size > 0) {
    const apartSizeConditions: string[] = [];
    sizesByApart.forEach((sizeRanges, apartId) => {
      const sizeConditions = sizeRanges
        .map(() => 't.exclusive_area BETWEEN ? AND ?')
        .join(' OR ');
      apartSizeConditions.push(`(t.apart_id = ? AND (${sizeConditions}))`);
      queryParams.push(apartId);
      sizeRanges.forEach(([minSize, maxSize]) => {
        queryParams.push(minSize, maxSize);
      });
    });
    whereConditions.push(`(${apartSizeConditions.join(' OR ')})`);
  } else {
    whereConditions.push(
      `t.apart_id IN (${apartIds.map(() => '?').join(', ')})`
    );
    queryParams.push(...apartIds);
  }

  whereConditions.push("t.cancellation_type != 'CANCELED'");

  if (period) {
    whereConditions.push('t.deal_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)');
    queryParams.push(period);
  }

  const sql = `
    WITH ranked AS (
      SELECT
        t.apart_id,
        a.apart_name,
        DATE_FORMAT(t.deal_date, '%Y%m') as month,
        t.deal_date,
        t.deal_amount,
        t.floor,
        t.exclusive_area,
        ROW_NUMBER() OVER (
          PARTITION BY t.apart_id, DATE_FORMAT(t.deal_date, '%Y%m')
          ORDER BY t.deal_date DESC
        ) as rn
      FROM transactions t
      LEFT JOIN apartments a ON t.apart_id = a.id
      WHERE ${whereConditions.join(' AND ')}
    )
    SELECT
      apart_id as apartId,
      apart_name as apartName,
      month,
      COUNT(*) as count,
      AVG(deal_amount) as averageAmount,
      MAX(CASE WHEN rn = 1 THEN deal_date END) as latestDealDate,
      MAX(CASE WHEN rn = 1 THEN deal_amount END) as latestDealAmount,
      MAX(CASE WHEN rn = 1 THEN floor END) as latestFloor,
      MAX(CASE WHEN rn = 1 THEN exclusive_area END) as latestSize
    FROM ranked
    GROUP BY apart_id, apart_name, month
    ORDER BY month DESC, apart_id ASC
  `;

  const rows = await query<DbMonthlyTransactionByIdsRow[]>(sql, queryParams);

  return rows;
};
