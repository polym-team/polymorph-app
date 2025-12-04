import { ApartTransactionItem } from '@/entities/apart-transaction';

import { TransactionListTable } from './ui/TransactionListTable';
import { useTransactionList } from './useTransactionList';

interface TransactionListProps {
  regionCode: string;
  transactionItems: ApartTransactionItem[];
}

export function TransactionList({
  regionCode,
  transactionItems,
}: TransactionListProps) {
  const {
    sorting,
    pageIndex,
    totalCount,
    items,
    changeSorting,
    changePageIndex,
  } = useTransactionList({
    regionCode,
    transactionItems,
  });

  return (
    <div className="space-y-2">
      <TransactionListTable
        items={items}
        totalCount={totalCount}
        sorting={sorting}
        pageIndex={pageIndex}
        onSortingChange={changeSorting}
        onPageIndexChange={changePageIndex}
      />
    </div>
  );
}
