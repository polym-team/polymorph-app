import { PeriodValue, SizesValue } from '../../types';
import { TransactionListTable } from './ui/TransactionListTable';
import { TrasactionYearSelect } from './ui/TransactionYearSelect';
import { useTransactionList } from './useTransactionList';

interface TransactionListProps {
  apartId: number;
  allSizes: SizesValue;
  selectedSizes: SizesValue;
  selectedPeriod: PeriodValue;
}

export function TransactionList({
  apartId,
  allSizes,
  selectedSizes,
  selectedPeriod,
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
  } = useTransactionList({ apartId, allSizes, selectedSizes, selectedPeriod });

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
