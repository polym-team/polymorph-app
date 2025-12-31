import {
  ApartTransactionSummary,
  DbMonthlyTransactionByIdsRow,
} from '../types';

export const convertToMonthlyTransactionsByIds = (
  dbRows: DbMonthlyTransactionByIdsRow[],
  availableSizesMap: Map<number, [number, number][]>
): ApartTransactionSummary[] => {
  // apartId별로 그룹화
  const apartMap = new Map<
    number,
    {
      apartName: string;
      rows: DbMonthlyTransactionByIdsRow[];
    }
  >();

  dbRows.forEach(row => {
    if (!apartMap.has(row.apartId)) {
      apartMap.set(row.apartId, {
        apartName: row.apartName,
        rows: [],
      });
    }
    apartMap.get(row.apartId)!.rows.push(row);
  });

  // 각 아파트별로 데이터 변환
  return Array.from(apartMap.entries())
    .map(([apartId, data]) => {
      // 월 기준 내림차순 정렬 (최근 월이 먼저)
      const sortedRows = data.rows.sort(
        (a, b) => parseInt(b.month, 10) - parseInt(a.month, 10)
      );

      // 최근 거래 정보 (가장 최근 월의 데이터)
      const latestRow = sortedRows[0];
      const recentTransaction =
        latestRow.latestDealDate &&
        latestRow.latestDealAmount !== null &&
        latestRow.latestFloor !== null &&
        latestRow.latestSize !== null
          ? {
              dealDate: latestRow.latestDealDate,
              dealAmount: Math.round(latestRow.latestDealAmount * 10000),
              floor: latestRow.latestFloor,
              size: latestRow.latestSize,
            }
          : null;

      // 월별 거래 정보
      const transactions = sortedRows.map(row => ({
        month: parseInt(row.month, 10),
        count: row.count,
        averageAmount: Math.round(row.averageAmount * 10000),
      }));

      return {
        apartId,
        apartName: data.apartName,
        availableSizes: availableSizesMap.get(apartId) || [],
        recentTransaction,
        transactions,
      };
    })
    .sort((a, b) => a.apartId - b.apartId);
};
