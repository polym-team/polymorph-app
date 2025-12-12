import { TransactionItem } from '@/entities/transaction';

import { calculateTransactionAverageAmount } from '../services/service';
import { SummaryState } from '../types';

type Params = {
  transactions: TransactionItem[];
};

type Return = SummaryState;

export const useTransactionSummary = ({ transactions }: Params): Return => {
  const transactionTotalCount = transactions.length;
  const transactionAverageAmount =
    calculateTransactionAverageAmount(transactions);

  return { transactionTotalCount, transactionAverageAmount };
};
