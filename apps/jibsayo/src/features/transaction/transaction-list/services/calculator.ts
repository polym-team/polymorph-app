import { TransactionItem } from '@/entities/transaction';
import { calculateAreaPyeong } from '@/shared/services/transactionService';

export const calculateTransactionAverageAmount = (
  transactions: TransactionItem[]
): number => {
  if (transactions.length === 0) return 0;

  const totalAmount = transactions.reduce(
    (acc, transaction) =>
      acc + transaction.tradeAmount / calculateAreaPyeong(transaction.size),
    0
  );

  return Math.floor(totalAmount / transactions.length);
};
