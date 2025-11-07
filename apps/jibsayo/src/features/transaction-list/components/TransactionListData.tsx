import { useTransactionPageSearchParams } from '@/entities/transaction';
import { ROUTE_PATH } from '@/shared/consts/route';
import { useNavigate } from '@/shared/hooks/useNavigate';

import { useTransactionData } from '../hooks/useTransactionData';
import { useTransactionViewSetting } from '../hooks/useTransactionViewSetting';
import { TransactionDetailItem } from '../models/types';
import { TransactionListSimpleTable } from '../ui/TransactionListSimpleTable';

export function TransactionListData() {
  const { navigate } = useNavigate();

  const { isLoading, transactionData, toggleFavorite } = useTransactionData();
  const { pageIndex, sorting, updateSorting, updatePageIndex } =
    useTransactionViewSetting();
  const { searchParams } = useTransactionPageSearchParams();

  const handleRowClick = (row: TransactionDetailItem) => {
    navigate(
      `${ROUTE_PATH.APART_DETAIL}?regionCode=${searchParams.regionCode}&apartName=${row.apartName}`
    );
  };

  const items = transactionData;
  const props = {
    isLoading,
    pageIndex,
    sorting,
    items,
    onRowClick: handleRowClick,
    onSortingChange: updateSorting,
    onPageIndexChange: updatePageIndex,
    onToggleFavorite: toggleFavorite,
  };

  return <TransactionListSimpleTable {...props} />;
}
