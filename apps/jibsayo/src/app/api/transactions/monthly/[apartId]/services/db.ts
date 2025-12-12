import { query } from '@/app/api/shared/libs/database';

import { DbMonthlyTransactionRow } from '../types';

export const getMonthlyTransactionsByApartId = async ({
  apartId,
  period,
  sizes,
}: {
  apartId: number;
  period?: number;
  sizes?: [number, number][];
}): Promise<DbMonthlyTransactionRow[]> => {
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

  const sql = `
    SELECT
      DATE_FORMAT(deal_date, '%Y%m') as month,
      exclusive_area as size,
      COUNT(*) as count,
      AVG(deal_amount) as averageAmount
    FROM transactions
    WHERE ${whereConditions.join(' AND ')}
    GROUP BY DATE_FORMAT(deal_date, '%Y%m'), exclusive_area
    ORDER BY month DESC, exclusive_area ASC
  `;

  const rows = await query<DbMonthlyTransactionRow[]>(sql, queryParams);

  return rows;
};
