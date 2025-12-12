import { TransactionState } from '../types';

export const calculateTransactionFetchStatus = ({
  isFetching,
  isLoadedData,
  transactionTotalCount,
}: {
  isFetching: boolean;
  isLoadedData: boolean;
  transactionTotalCount: number;
}): TransactionState['fetchStatus'] => {
  if (isFetching) {
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
