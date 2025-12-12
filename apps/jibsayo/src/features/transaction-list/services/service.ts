import { TransactionState } from '../types';

export const calculateTransactionFetchStatus = ({
  isLoading,
  isLoadedData,
  transactionTotalCount,
}: {
  isLoading: boolean;
  isLoadedData: boolean;
  transactionTotalCount: number;
}): TransactionState['fetchStatus'] => {
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
