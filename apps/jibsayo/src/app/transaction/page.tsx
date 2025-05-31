import { TransactionList } from '@/features/transaction-list';
import { TransactionSearch } from '@/features/transaction-search';

export default function TransactionPage() {
  return (
    <section>
      <div className="flex flex-col gap-y-2">
        <TransactionSearch />
        <TransactionList />
      </div>
    </section>
  );
}
