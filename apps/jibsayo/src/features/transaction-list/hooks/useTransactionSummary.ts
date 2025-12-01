import { TransactionItem } from '@/entities/transaction';

import { calculateTransactionAverageAmount } from '../services/service';
import { SummaryState } from '../types';

type Params = {
  filteredTransactions: TransactionItem[];
};

type Return = SummaryState;

export const useTransactionSummary = ({
  filteredTransactions,
}: Params): Return => {
  const transactionTotalCount = filteredTransactions.length;
  const transactionAverageAmount =
    calculateTransactionAverageAmount(filteredTransactions);

  return { transactionTotalCount, transactionAverageAmount };
};
