import { TransactionList } from '@/features/transaction-list';
import { FavoriteRegionList, SearchForm } from '@/features/transaction-search';

export default function TransactionPage() {
  return (
    <section>
      <div className="flex flex-col gap-y-2">
        <SearchForm />
        <FavoriteRegionList />
        <TransactionList />
      </div>
    </section>
  );
}
