import { SortingState, SummaryState } from '../../types';
import { Sorting } from './ui/Sorting';
import { Summary } from './ui/Summary';
import { useTransactionListHeader } from './useTransactionListHeader';

interface TransactionListHeaderProps {
  isLoading: boolean;
  summary: SummaryState;
  sorting: SortingState;
}

export function TransactionListHeader({
  isLoading,
  summary,
  sorting,
}: TransactionListHeaderProps) {
  const { cityName, regionName } = useTransactionListHeader();

  return (
    <div className="flex items-center justify-between">
      <div>
        <Summary
          isLoading={isLoading}
          cityName={cityName}
          regionName={regionName}
          summary={summary}
        />
      </div>
      <div className="lg:hidden">
        <Sorting isLoading={isLoading} sorting={sorting} />
      </div>
    </div>
  );
}
