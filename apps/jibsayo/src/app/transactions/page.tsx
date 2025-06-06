import { TransactionList } from '@/features/transaction-list';
import { TransactionSearch } from '@/features/transaction-search';

import { getTransactions } from './service';

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { regionCode?: string; tradeDate?: string };
}) {
  const { regionCode, tradeDate } = searchParams;

  if (!regionCode || !tradeDate) {
    return null;
  }

  const data = await getTransactions(regionCode, tradeDate);

  if (!data) {
    return null;
  }

  return (
    <main className="container mx-auto py-8">
      <div className="flex flex-col gap-y-5">
        <TransactionSearch />
        <TransactionList regionCode={regionCode} data={data} />
      </div>
    </main>
  );
}
