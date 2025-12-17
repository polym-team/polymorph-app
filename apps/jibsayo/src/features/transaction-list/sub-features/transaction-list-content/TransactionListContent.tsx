import {
  HandlerState,
  PageIndexState,
  SortingState,
  TransactionState,
} from '../../types';
import { TransactionCardList } from './ui/TransactionCardList';
import { TransactionTableList } from './ui/TransactionTableList';

interface TransactionListContentProps {
  sorting: SortingState;
  pageIndex: PageIndexState;
  transaction: TransactionState;
  handlers: HandlerState;
}

export function TransactionListContent({
  sorting,
  pageIndex,
  transaction,
  handlers,
}: TransactionListContentProps) {
  return (
    <>
      <div className="hidden lg:block">
        <TransactionTableList
          isFetching={transaction.fetchStatus === 'LOADING'}
          sorting={sorting.state}
          pageIndex={pageIndex.state}
          totalCount={transaction.totalCount}
          items={transaction.items}
          onSortingChange={sorting.update}
          onPageIndexChange={pageIndex.update}
          onFavoriteToggle={handlers.toggleFavorite}
          onRowClick={handlers.navigateToApartDetail}
        />
      </div>
      <div className="lg:hidden">
        <TransactionCardList
          isFetching={transaction.fetchStatus === 'LOADING'}
          pageIndex={pageIndex.state}
          totalCount={transaction.totalCount}
          items={transaction.items}
          onPageIndexChange={pageIndex.update}
          onFavoriteToggle={handlers.toggleFavorite}
          onRowClick={handlers.navigateToApartDetail}
        />
      </div>
    </>
  );
}
