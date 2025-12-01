import {
  PageIndexState,
  SortingState,
  SummaryState,
  TransactionItemViewModel,
} from '../../types';
import { TransactionCardList } from './ui/TransactionCardList';
import { TransactionTableList } from './ui/TransactionTableList';

interface TransactionListContentProps {
  isLoading: boolean;
  summary: SummaryState;
  sorting: SortingState;
  pageIndex: PageIndexState;
  items: TransactionItemViewModel[];
  onFavoriteToggle: (item: TransactionItemViewModel) => void;
  onRowClick: (item: TransactionItemViewModel) => void;
}

export function TransactionListContent({
  isLoading,
  sorting,
  summary,
  pageIndex,
  items,
  onFavoriteToggle,
  onRowClick,
}: TransactionListContentProps) {
  return (
    <div>
      <div className="hidden lg:block">
        <TransactionTableList
          isLoading={isLoading}
          summary={summary}
          sorting={sorting}
          pageIndex={pageIndex}
          items={items}
          onFavoriteToggle={onFavoriteToggle}
          onRowClick={onRowClick}
        />
      </div>
      <div className="lg:hidden">
        <TransactionCardList
          isLoading={isLoading}
          summary={summary}
          pageIndex={pageIndex}
          items={items}
          onFavoriteToggle={onFavoriteToggle}
          onRowClick={onRowClick}
        />
      </div>
    </div>
  );
}
