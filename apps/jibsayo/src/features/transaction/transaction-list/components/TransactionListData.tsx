import { useGlobalConfigStore } from '@/shared/stores/globalConfigStore';

import { useTransactionViewSetting } from '../hooks/useTransactionViewSetting';
import { useTransactionData } from '../hooks/useTrasactionData';
import { TransactionListSimpleTable } from '../ui/TransactionListSimpleTable';

export function TransactionListData() {
  const { isMobile } = useGlobalConfigStore();
  const { transactionData } = useTransactionData();
  const { pageIndex, sorting, updateSorting, updatePageIndex } =
    useTransactionViewSetting();

  const items = transactionData;
  const props = {
    pageIndex,
    sorting,
    items,
    onSortingChange: updateSorting,
    onPageIndexChange: updatePageIndex,
  };

  return isMobile ? (
    <TransactionListSimpleTable {...props} />
  ) : (
    <TransactionListSimpleTable {...props} />
  );
}
