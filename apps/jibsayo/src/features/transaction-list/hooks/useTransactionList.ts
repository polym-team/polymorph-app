import {
  PageIndexState,
  SortingState,
  SummaryState,
  TransactionItemViewModel,
  TransactionStatus,
} from '../types';
import { useTransactionData } from './useTransactionData';
import { useTransactionHandler } from './useTransactionHandler';
import { useTransactionStatus } from './useTransactionStatus';
import { useTransactionSummary } from './useTransactionSummary';
import { useTransactionViewSetting } from './useTransactionViewSetting';

interface Return {
  summary: SummaryState;
  sorting: SortingState;
  pageIndex: PageIndexState;
  transactionStatus: TransactionStatus;
  transactionItems: TransactionItemViewModel[];
  toggleFavorite: (item: TransactionItemViewModel) => void;
  navigateToApartDetail: (item: TransactionItemViewModel) => void;
}

export const useTransactionList = (): Return => {
  const { pageIndex, sorting } = useTransactionViewSetting();
  const { filteredTransactions, convertedTransactions } = useTransactionData({
    pageIndex: pageIndex.state,
    sorting: sorting.state,
  });
  const { transactionStatus } = useTransactionStatus({ filteredTransactions });
  const { toggleFavorite, navigateToApartDetail } = useTransactionHandler();

  const summary = useTransactionSummary({ filteredTransactions });
  const transactionItems = convertedTransactions;

  return {
    summary,
    sorting,
    pageIndex,
    transactionStatus,
    transactionItems,
    toggleFavorite,
    navigateToApartDetail,
  };
};
