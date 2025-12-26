import {
  HandlerState,
  PageIndexState,
  SortingState,
  TransactionState,
} from '../../types';
import { CardView } from './ui/CardView';
import { TableView } from './ui/TableView';

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
        <TableView
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
        <CardView
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
