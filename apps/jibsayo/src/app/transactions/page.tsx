import { TransactionList } from '@/features/transaction-list/components/TransactionList';
import { TransactionSearch } from '@/features/transaction-search';

export default async function TransactionsPage() {
  return (
    <div className="flex flex-col gap-y-5">
      <TransactionSearch />
      <TransactionList />
    </div>
  );
}
