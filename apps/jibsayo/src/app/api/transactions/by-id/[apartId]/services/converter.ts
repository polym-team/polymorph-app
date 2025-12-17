import { DbTransactionRow, TransactionItem } from '../types';

export const covertToTransactionItem = (
  dbRows: DbTransactionRow[]
): TransactionItem[] => {
  return dbRows.map(row => {
    const prevTransaction: Omit<DbTransactionRow, 'prevTransaction'> | null =
      row.prevTransaction ? JSON.parse(row.prevTransaction) : null;
    const prevDealAmount = prevTransaction
      ? prevTransaction.dealAmount * 10000
      : 0;
    const dealAmount = row.dealAmount * 10000;

    const changeRate =
      prevDealAmount > 0
        ? Math.round(
            ((dealAmount - prevDealAmount) / prevDealAmount) * 100 * 100
          ) / 100
        : 0;

    const result: TransactionItem = {
      id: row.id,
      dealDate: row.dealDate,
      cancellationDate: row.cancellationDate,
      floor: row.floor,
      size: parseFloat(row.size),
      isNewTransaction: Boolean(row.isNewTransaction),
      dealAmount,
      prevTransaction: prevTransaction
        ? {
            dealDate: prevTransaction.dealDate,
            size: parseFloat(prevTransaction.size),
            floor: prevTransaction.floor,
            dealAmount: prevDealAmount,
          }
        : null,
      changeRate,
    };

    return result;
  });
};
