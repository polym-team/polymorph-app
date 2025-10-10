import { useSearchParams } from '@/entities/transaction';

import { useTransactionViewSetting } from '../hooks/useTransactionViewSetting';
import { useTransactionData } from '../hooks/useTrasactionData';
import { TransactionListSimpleTable } from '../ui/TransactionListSimpleTable';

export function TransactionListData() {
  const { isLoading, transactionData } = useTransactionData();
  const { pageIndex, sorting, updateSorting, updatePageIndex } =
    useTransactionViewSetting();
  const { searchParams } = useSearchParams();

  const items = transactionData;
  const regionCode = searchParams.regionCode;
  const props = {
    isLoading,
    pageIndex,
    sorting,
    items,
    regionCode,
    onSortingChange: updateSorting,
    onPageIndexChange: updatePageIndex,
  };

  return <TransactionListSimpleTable {...props} />;
}
