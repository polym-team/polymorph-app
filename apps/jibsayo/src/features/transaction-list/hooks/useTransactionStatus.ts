import {
  TransactionItem,
  useTransactionListQuery,
} from '@/entities/transaction';

import { calculateTransactionListStatus } from '../services/service';
import { TransactionStatus } from '../types';

interface Params {
  filteredTransactions: TransactionItem[];
}

interface Return {
  transactionStatus: TransactionStatus;
}

export const useTransactionStatus = ({
  filteredTransactions,
}: Params): Return => {
  const { data: transactionListData, isLoading: isTransactionListLoading } =
    useTransactionListQuery();

  const transactionStatus = calculateTransactionListStatus({
    isLoading: isTransactionListLoading,
    isLoadedData: !!transactionListData,
    transactionTotalCount: filteredTransactions.length,
  });

  return { transactionStatus };
};
