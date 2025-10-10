'use client';

import { TransactionListData } from './TransactionListData';
import { TransactionSummary } from './TransactionSummary';

export function TransactionList() {
  return (
    <div className="flex flex-col gap-y-3">
      <TransactionSummary />
      <TransactionListData />
    </div>
  );
}
