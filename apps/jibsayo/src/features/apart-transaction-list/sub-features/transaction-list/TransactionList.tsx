import { ApartTransactionItem } from '@/entities/apart-transaction';

import { TransactionListTable } from './ui/TransactionListTable';
import { TrasactionYearSelect } from './ui/TransactionYearSelect';
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
    years,
    yearCounts,
    changeSorting,
    changePageIndex,
    changeYear,
  } = useTransactionList({
    regionCode,
    transactionItems,
  });

  return (
    <div className="flex flex-col gap-y-3">
      <TrasactionYearSelect
        years={years}
        yearCounts={yearCounts}
        onYearChange={changeYear}
      />
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
