import { useTransactionListQuery } from '@/entities/transaction';

import { calculateTransactionAverageAmount } from '../services/service';
import { SummaryState } from '../types';

type Return = SummaryState;

export const useTransactionSummary = (): Return => {
  const { data: transactionListData } = useTransactionListQuery();

  const transactionTotalCount = transactionListData?.totalCount ?? 0;
  const transactionAverageAmount = calculateTransactionAverageAmount(
    transactionListData?.transactions ?? []
  );

  return { transactionTotalCount, transactionAverageAmount };
};
