import { useTransactionViewSetting } from '../hooks/useTransactionViewSetting';
import { useTransactionData } from '../hooks/useTrasactionData';
import { TransactionListSimpleTable } from '../ui/TransactionListSimpleTable';

export function TransactionListData() {
  const { isLoading, transactionData, toggleFavoriteApart } =
    useTransactionData();
  const { pageIndex, sorting, updateSorting, updatePageIndex } =
    useTransactionViewSetting();

  const items = transactionData;
  const props = {
    isLoading,
    pageIndex,
    sorting,
    items,
    onSortingChange: updateSorting,
    onPageIndexChange: updatePageIndex,
    onFavoriteToggle: toggleFavoriteApart,
  };

  return <TransactionListSimpleTable {...props} />;
}
