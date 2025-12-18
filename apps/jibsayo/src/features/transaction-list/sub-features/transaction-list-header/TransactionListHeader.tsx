import { SortingState, TransactionState } from '../../types';
import { Sorting } from './ui/Sorting';
import { Summary } from './ui/Summary';
import { useTransactionListHeader } from './useTransactionListHeader';

interface TransactionListHeaderProps {
  transaction: TransactionState;
  sorting: SortingState;
}

export function TransactionListHeader({
  transaction,
  sorting,
}: TransactionListHeaderProps) {
  const { cityName, regionName } = useTransactionListHeader();

  if (transaction.fetchStatus === 'NOT_SEARCHED') {
    return null;
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <Summary
          isLoading={transaction.fetchStatus === 'LOADING'}
          cityName={cityName}
          regionName={regionName}
          totalCount={transaction.totalCount}
          averageAmount={transaction.averageAmount}
        />
      </div>
      <div className="lg:hidden">
        <Sorting sorting={sorting} />
      </div>
    </div>
  );
}
