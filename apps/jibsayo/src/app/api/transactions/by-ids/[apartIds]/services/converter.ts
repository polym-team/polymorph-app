import {
  DbMonthlyTransactionByIdsRow,
  MonthlyTransactionByIdsItem,
  TransactionByIdSummary,
} from '../types';

export const convertToMonthlyTransactionsByIds = (
  dbRows: DbMonthlyTransactionByIdsRow[]
): MonthlyTransactionByIdsItem[] => {
  const monthlyMap = new Map<number, TransactionByIdSummary[]>();

  dbRows.forEach(row => {
    const month = parseInt(row.month, 10);
    const apartId = row.apartId;
    const apartName = row.apartName;
    const averageAmount = row.averageAmount;

    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, []);
    }

    const monthData = monthlyMap.get(month)!;
    monthData.push({
      id: apartId,
      apartName,
      averageAmount: Math.round(averageAmount * 10000),
      latestDealDate: row.latestDealDate,
      latestDealAmount: row.latestDealAmount
        ? Math.round(row.latestDealAmount * 10000)
        : null,
      latestFloor: row.latestFloor,
      latestSize: row.latestSize,
    });
  });

  return Array.from(monthlyMap.entries())
    .map(([month, transactions]) => ({
      month,
      transactions: transactions.sort((a, b) => a.id - b.id),
    }))
    .sort((a, b) => b.month - a.month);
};
