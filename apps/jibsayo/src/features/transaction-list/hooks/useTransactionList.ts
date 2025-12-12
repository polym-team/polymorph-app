import {
  HandlerState,
  PageIndexState,
  SortingState,
  TransactionState,
} from '../types';
import { useTransactionData } from './useTransactionData';
import { useTransactionHandlers } from './useTransactionHandlers';
import { useTransactionPageIndex } from './useTransactionPageIndex';
import { useTransactionSorting } from './useTransactionSorting';

interface Return {
  sorting: SortingState;
  pageIndex: PageIndexState;
  transaction: TransactionState;
  handlers: HandlerState;
}

export const useTransactionList = (): Return => {
  const sorting = useTransactionSorting();
  const pageIndex = useTransactionPageIndex();
  const transaction = useTransactionData();
  const handlers = useTransactionHandlers();

  return {
    sorting,
    pageIndex,
    transaction,
    handlers,
  };
};
