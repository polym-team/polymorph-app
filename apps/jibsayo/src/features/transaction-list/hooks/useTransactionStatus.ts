import { useTransactionListQuery } from '@/entities/transaction';

import { calculateTransactionListStatus } from '../services/service';
import { TransactionStatus } from '../types';

interface Return {
  transactionStatus: TransactionStatus;
}

export const useTransactionStatus = (): Return => {
  const { data: transactionListData, isLoading: isTransactionListLoading } =
    useTransactionListQuery();

  const transactionStatus = calculateTransactionListStatus({
    isLoading: isTransactionListLoading,
    isLoadedData: !!transactionListData,
    transactionTotalCount: transactionListData?.totalCount ?? 0,
  });

  return { transactionStatus };
};
