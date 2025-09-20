import { TransactionItem } from '@/entities/transaction';
import { useGlobalConfigStore } from '@/shared/stores/globalConfigStore';

import { TransactionListDetailTable } from './TransactionListDetailTable';
import { TransactionListSimpleTable } from './TransactionListSimpleTable';

export function TransactionListTable({ items }: { items: TransactionItem[] }) {
  const { isMobile } = useGlobalConfigStore();

  console.log('isMobile: ', isMobile);

  return isMobile ? (
    <TransactionListSimpleTable pageIndex={0} items={items} />
  ) : (
    <TransactionListDetailTable pageIndex={0} items={items} />
  );
}
