import { useTransactionListQuery } from '@/entities/transaction';

import { TransactionListTable } from '../ui/TransactionListTable';

interface TransactionListDataProps {
  pageIndex: number;
}

export function TransactionListData({ pageIndex }: TransactionListDataProps) {
  const { data } = useTransactionListQuery();

  const items = data?.list ?? [];

  return <TransactionListTable items={items} />;
}
