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
    SELECT
      t.apart_id as apartId,
      a.apart_name as apartName,
      DATE_FORMAT(t.deal_date, '%Y%m') as month,
      COUNT(*) as count,
      AVG(t.deal_amount) as averageAmount
    FROM transactions t
    LEFT JOIN apartments a ON t.apart_id = a.id
    WHERE ${whereConditions.join(' AND ')}
    GROUP BY t.apart_id, a.apart_name, DATE_FORMAT(t.deal_date, '%Y%m')
    ORDER BY month DESC, t.apart_id ASC
  `;

  const rows = await query<DbMonthlyTransactionByIdsRow[]>(sql, queryParams);

  return rows;
};
