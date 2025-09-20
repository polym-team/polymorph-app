'use client';

import { useTransactionViewSetting } from '../hooks/useTransactionViewSetting';
import { TransactionListData } from './TransactionListData';
import { TransactionListHeader } from './TransactionListHeader';

export function TransactionList() {
  const { pageIndex } = useTransactionViewSetting();

  return (
    <div>
      <TransactionListHeader />
      <TransactionListData pageIndex={pageIndex} />
    </div>
  );
}
