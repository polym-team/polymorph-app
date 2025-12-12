import { groupSizesByPyeong } from '@/app/api/shared/services/transaction/service';

import {
  DbMonthlyTransactionRow,
  MonthlyTransactionItem,
  TransactionSummary,
} from '../types';

interface SizeGroupData {
  sizes: [number, number];
  totalCount: number;
  totalAmount: number;
  totalTransactions: number;
}

export const convertToMonthlyTransactions = (
  dbRows: DbMonthlyTransactionRow[]
): MonthlyTransactionItem[] => {
  const monthlyMap = new Map<number, Map<string, SizeGroupData>>();

  dbRows.forEach(row => {
    const month = parseInt(row.month, 10);
    const size = parseFloat(row.size);
    const count = Number(row.count);
    const averageAmount = row.averageAmount;

    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, new Map());
    }

    const monthData = monthlyMap.get(month)!;
    const allSizes = Array.from(
      new Set(
        dbRows
          .filter(r => parseInt(r.month, 10) === month)
          .map(r => parseFloat(r.size))
      )
    );

    const sizeGroups = groupSizesByPyeong(allSizes);
    const groupKey = sizeGroups.find(
      ([min, max]) => size >= min && size <= max
    );

    if (groupKey) {
      const key = `${groupKey[0]}-${groupKey[1]}`;

      if (!monthData.has(key)) {
        monthData.set(key, {
          sizes: groupKey,
          totalCount: 0,
          totalAmount: 0,
          totalTransactions: 0,
        });
      }

      const groupData = monthData.get(key)!;
      groupData.totalCount += count;
      groupData.totalAmount += averageAmount * count;
      groupData.totalTransactions += count;
    }
  });

  return Array.from(monthlyMap.entries())
    .map(([month, sizeGroupMap]) => {
      const transactions: TransactionSummary[] = Array.from(
        sizeGroupMap.values()
      ).map(groupData => ({
        sizes: groupData.sizes,
        count: groupData.totalCount,
        averageAmount: Math.round(
          (groupData.totalAmount / groupData.totalTransactions) * 10000
        ),
      }));

      return {
        month,
        transactions: transactions.sort((a, b) => a.sizes[0] - b.sizes[0]),
      };
    })
    .sort((a, b) => b.month - a.month);
};
