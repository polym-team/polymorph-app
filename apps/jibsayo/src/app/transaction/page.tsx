import { TransactionList } from '@/features/transaction-list';
import { TransactionSearch } from '@/features/transaction-search';

export default async function TransactionPage() {
  return (
    <div className="flex flex-col gap-y-5">
      <TransactionSearch />
      <TransactionList />
    </div>
  );
}
