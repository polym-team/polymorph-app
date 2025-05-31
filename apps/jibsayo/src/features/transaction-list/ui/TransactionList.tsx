'use client';

import { useTransactionListQuery } from '../models/useTransactionListQuery';

export function TransactionList() {
  const { data } = useTransactionListQuery();

  return (
    <div>
      <h1>TransactionList</h1>
      <div>{JSON.stringify(data)}</div>
    </div>
  );
}
