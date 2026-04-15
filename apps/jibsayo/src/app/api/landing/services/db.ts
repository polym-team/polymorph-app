import { query } from '@/app/api/shared/libs/database';

interface RecentTransaction {
  id: number;
  apartId: number | null;
  apartName: string;
  regionCode: string;
  regionName: string;
  dealDate: string;
  dealAmount: number;
  exclusiveArea: number;
  floor: number;
  householdCount: number | null;
  completionYear: number | null;
}

interface RegionPriceSummary {
  regionCode: string;
  regionName: string;
  avgPrice: number;
  transactionCount: number;
  prevAvgPrice: number | null;
  prevTransactionCount: number;
}

/**
 * 최근 실거래 목록 (전국, 최신 20건)
 */
export async function fetchRecentTransactions(): Promise<RecentTransaction[]> {
  const rows = await query<RecentTransaction[]>(
    `SELECT
      t.id,
      t.apart_id AS apartId,
      COALESCE(a.apart_name, '알 수 없음') AS apartName,
      t.region_code AS regionCode,
      r.region_name AS regionName,
      t.deal_date AS dealDate,
      t.deal_amount AS dealAmount,
      t.exclusive_area AS exclusiveArea,
      t.floor,
      a.total_household_count AS householdCount,
      a.completion_year AS completionYear
    FROM transactions t
    LEFT JOIN apartments a ON t.apart_id = a.id
    LEFT JOIN regions r ON t.region_code = r.region_code
    WHERE t.cancellation_type = 'NONE'
      AND t.apart_id IS NOT NULL
    ORDER BY t.deal_date DESC, t.id DESC
    LIMIT 20`
  );

  return rows.map(row => ({
    ...row,
    dealAmount: row.dealAmount * 10000,
  }));
}

/**
 * 주요 지역(서울 주요 구) 이번달/전월 평균 시세 비교
 */
export async function fetchRegionPriceSummaries(): Promise<RegionPriceSummary[]> {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonth = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-01`;
  const prevMonthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  // 서울 주요 지역
  const targetRegions = [
    '11680', // 강남구
    '11650', // 서초구
    '11710', // 송파구
    '11440', // 마포구
    '11200', // 성동구
    '11170', // 용산구
    '11560', // 영등포구
    '11740', // 강동구
  ];

  const placeholders = targetRegions.map(() => '?').join(',');

  const rows = await query<Array<{
    regionCode: string;
    regionName: string;
    avgPrice: number;
    transactionCount: number;
  }>>(
    `SELECT
      t.region_code AS regionCode,
      r.region_name AS regionName,
      ROUND(AVG(t.deal_amount)) AS avgPrice,
      COUNT(*) AS transactionCount
    FROM transactions t
    JOIN regions r ON t.region_code = r.region_code
    WHERE t.region_code IN (${placeholders})
      AND t.deal_date >= ?
      AND t.cancellation_type = 'NONE'
    GROUP BY t.region_code, r.region_name
    ORDER BY AVG(t.deal_amount) DESC`,
    [...targetRegions, thisMonth]
  );

  const prevRows = await query<Array<{
    regionCode: string;
    avgPrice: number;
    transactionCount: number;
  }>>(
    `SELECT
      t.region_code AS regionCode,
      ROUND(AVG(t.deal_amount)) AS avgPrice,
      COUNT(*) AS transactionCount
    FROM transactions t
    WHERE t.region_code IN (${placeholders})
      AND t.deal_date >= ? AND t.deal_date < ?
      AND t.cancellation_type = 'NONE'
    GROUP BY t.region_code`,
    [...targetRegions, prevMonth, prevMonthEnd]
  );

  const prevMap = new Map(prevRows.map(r => [r.regionCode, r]));

  return rows.map(row => {
    const prev = prevMap.get(row.regionCode);
    return {
      regionCode: row.regionCode,
      regionName: row.regionName,
      avgPrice: row.avgPrice * 10000,
      transactionCount: row.transactionCount,
      prevAvgPrice: prev ? prev.avgPrice * 10000 : null,
      prevTransactionCount: prev?.transactionCount ?? 0,
    };
  });
}
