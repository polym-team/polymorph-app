import { useTransactionPageSearchParams } from '@/entities/transaction';
import { ROUTE_PATH } from '@/shared/consts/route';

import { useRouter } from 'next/navigation';

import { useTransactionViewSetting } from '../hooks/useTransactionViewSetting';
import { useTransactionData } from '../hooks/useTrasactionData';
import { TransactionDetailItem } from '../models/types';
import { TransactionListSimpleTable } from '../ui/TransactionListSimpleTable';

export function TransactionListData() {
  const router = useRouter();

  const { isLoading, transactionData } = useTransactionData();
  const { pageIndex, sorting, updateSorting, updatePageIndex } =
    useTransactionViewSetting();
  const { searchParams } = useTransactionPageSearchParams();

  const handleRowClick = (row: TransactionDetailItem) => {
    router.push(
      `${ROUTE_PATH.APART_DETAIL}?regionCode=${searchParams.regionCode}&apartName=${row.apartName}`
    );
  };

  const items = transactionData;
  const regionCode = searchParams.regionCode;
  const props = {
    isLoading,
    pageIndex,
    sorting,
    items,
    regionCode,
    onRowClick: handleRowClick,
    onSortingChange: updateSorting,
    onPageIndexChange: updatePageIndex,
  };

  return <TransactionListSimpleTable {...props} />;
}
