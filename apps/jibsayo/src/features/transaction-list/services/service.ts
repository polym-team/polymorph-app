import { calculateAreaPyeong, TransactionItem } from '@/entities/transaction';

import { TransactionStatus } from '../types';

export const calculateTransactionListStatus = ({
  isLoading,
  isLoadedData,
  transactionTotalCount,
}: {
  isLoading: boolean;
  isLoadedData: boolean;
  transactionTotalCount: number;
}): TransactionStatus => {
  if (isLoading) {
    return 'LOADING';
  }

  if (!isLoadedData) {
    return 'NOT_SEARCHED';
  }

  if (!transactionTotalCount) {
    return 'EMPTY';
  }

  return 'LOADED';
};

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
