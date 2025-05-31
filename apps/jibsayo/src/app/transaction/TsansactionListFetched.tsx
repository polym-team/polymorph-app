import { TransactionList } from '@/features/transaction-list';
import { fetchTransactionData } from '@/features/transaction-search/api/fetchTransactionData';

interface Props {
  regionCode: string;
  tradeDate: string;
}

export async function TsansactionListFetched({ regionCode, tradeDate }: Props) {
  const data = await fetchTransactionData(regionCode, tradeDate);

  return <TransactionList isLoading={false} data={data} />;
}
