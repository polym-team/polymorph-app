import { TransactionList } from '@/features/transaction-list';
import { TransactionSearch } from '@/features/transaction-search';

export default function TransactionPage() {
  return (
    <section>
      <div className="flex flex-col gap-y-5">
        <TransactionSearch />
        <TransactionList />
      </div>
    </section>
  );
}
