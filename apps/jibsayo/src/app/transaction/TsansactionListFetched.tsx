import { TransactionList } from '@/features/transaction-list';

import { TransactionsResponse } from '../api/transactions/types';

interface Props {
  regionCode: string;
  tradeDate: string;
}

async function fetchTransactionData(
  regionCode: string,
  tradeDate: string
): Promise<TransactionsResponse> {
  try {
    const response = await fetch(
      `http://localhost:3000/api/transactions?area=${regionCode}&createDt=${tradeDate}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return { count: 0, list: [] };
  }
}

export async function TsansactionListFetched({ regionCode, tradeDate }: Props) {
  const data = await fetchTransactionData(regionCode, tradeDate);

  return <TransactionList isLoading={false} data={data} />;
}
