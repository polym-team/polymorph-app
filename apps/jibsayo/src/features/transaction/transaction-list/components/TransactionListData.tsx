import { useTransactionListQuery } from '@/entities/transaction';
import { useGlobalConfigStore } from '@/shared/stores/globalConfigStore';

import { SortingState } from '@package/ui';

import { TransactionListDetailTable } from '../ui/TransactionListDetailTable';
import { TransactionListSimpleTable } from '../ui/TransactionListSimpleTable';

interface TransactionListDataProps {
  pageIndex: number;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  onPageIndexChange: (pageIndex: number) => void;
}

export function TransactionListData({
  pageIndex,
  sorting,
  onSortingChange,
  onPageIndexChange,
}: TransactionListDataProps) {
  const { isMobile } = useGlobalConfigStore();
  const { data } = useTransactionListQuery();

  const items = data?.list ?? [];
  const props = {
    pageIndex,
    sorting,
    items,
    onSortingChange,
    onPageIndexChange,
  };

  return isMobile ? (
    <TransactionListSimpleTable {...props} />
  ) : (
    <TransactionListSimpleTable {...props} />
  );
}
