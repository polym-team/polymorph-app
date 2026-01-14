import { query } from '@/app/api/shared/libs/database';

import { TransactionItem } from '../types';

interface DbTransactionRow {
  id: number;
  dealDate: string;
  size: number;
  floor: number;
  dealAmount: number;
}

export const getLatestTransactionByApartId = async (
  apartId: number
): Promise<TransactionItem | null> => {
  const sql = `
    SELECT
      id,
      deal_date as dealDate,
      exclusive_area as size,
      floor,
      deal_amount as dealAmount
    FROM transactions
    WHERE apart_id = ?
      AND cancellation_type != 'CANCELED'
    ORDER BY deal_date DESC
    LIMIT 1
  `;

  const rows = await query<DbTransactionRow[]>(sql, [apartId]);

  return rows[0] || null;
};

export const getHighestPriceTransactionByApartId = async (
  apartId: number
): Promise<TransactionItem | null> => {
  const sql = `
    SELECT
      id,
      deal_date as dealDate,
      exclusive_area as size,
      floor,
      deal_amount as dealAmount
    FROM transactions
    WHERE apart_id = ?
      AND cancellation_type != 'CANCELED'
    ORDER BY deal_amount DESC, deal_date DESC
    LIMIT 1
  `;

  const rows = await query<DbTransactionRow[]>(sql, [apartId]);

  return rows[0] || null;
};

export const getLowestPriceTransactionByApartId = async (
  apartId: number
): Promise<TransactionItem | null> => {
  const sql = `
    SELECT
      id,
      deal_date as dealDate,
      exclusive_area as size,
      floor,
      deal_amount as dealAmount
    FROM transactions
    WHERE apart_id = ?
      AND cancellation_type != 'CANCELED'
      AND deal_date >= DATE_SUB(CURDATE(), INTERVAL 5 YEAR)
    ORDER BY deal_amount ASC, deal_date DESC
    LIMIT 1
  `;

  const rows = await query<DbTransactionRow[]>(sql, [apartId]);

  return rows[0] || null;
};

export const hasNewTransactionByApartId = async (
  apartId: number
): Promise<boolean> => {
  const sql = `
    SELECT COUNT(*) as count
    FROM transactions
    WHERE apart_id = ?
      AND DATE(created_at) = CURDATE()
  `;

  const rows = await query<{ count: number }[]>(sql, [apartId]);

  return (rows[0]?.count || 0) > 0;
};

export const getNewTransactionByApartId = async (
  apartId: number
): Promise<TransactionItem | null> => {
  const sql = `
    SELECT
      id,
      deal_date as dealDate,
      exclusive_area as size,
      floor,
      deal_amount as dealAmount
    FROM transactions
    WHERE apart_id = ?
      AND DATE(created_at) = CURDATE()
      AND cancellation_type != 'CANCELED'
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const rows = await query<DbTransactionRow[]>(sql, [apartId]);

  return rows[0] || null;
};
