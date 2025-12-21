import { query } from '@/app/api/shared/libs/database';

import { DbMonthlyTransactionByIdsRow } from '../types';

export const getMonthlyTransactionsByApartIds = async ({
  apartIds,
  period,
}: {
  apartIds: number[];
  period?: number;
}): Promise<DbMonthlyTransactionByIdsRow[]> => {
  if (apartIds.length === 0) {
    return [];
  }

  const whereConditions = [
    `t.apart_id IN (${apartIds.map(() => '?').join(', ')})`,
    "t.cancellation_type != 'CANCELED'",
  ];
  const queryParams: (string | number)[] = [...apartIds];

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
