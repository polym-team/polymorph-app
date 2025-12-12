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
  transactions: TransactionItemViewModel[];
  toggleFavorite: (item: TransactionItemViewModel) => void;
  navigateToApartDetail: (item: TransactionItemViewModel) => void;
}

export const useTransactionList = (): Return => {
  const { pageIndex, sorting } = useTransactionViewSetting();

  const { transactions } = useTransactionData();
  const { transactionStatus } = useTransactionStatus();
  const { toggleFavorite, navigateToApartDetail } = useTransactionHandler();
  const summary = useTransactionSummary();

  return {
    summary,
    sorting,
    pageIndex,
    transactionStatus,
    transactions,
    toggleFavorite,
    navigateToApartDetail,
  };
};
