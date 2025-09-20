import { TransactionItem } from '@/entities/transaction';
import { useGlobalConfigStore } from '@/shared/stores/globalConfigStore';

import { TransactionListDetailTable } from './TransactionListDetailTable';
import { TransactionListSimpleTable } from './TransactionListSimpleTable';

export function TransactionListTable({ items }: { items: TransactionItem[] }) {
  const { isMobile } = useGlobalConfigStore();

  const props = { pageIndex: 0, items };

  return isMobile ? (
    <TransactionListSimpleTable {...props} />
  ) : (
    <TransactionListDetailTable {...props} />
  );
}
