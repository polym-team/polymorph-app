import { TransactionsResponse } from '@/app/api/transactions/types';

interface Props {
  isLoading: boolean;
  data: TransactionsResponse;
}

export function TransactionList({ isLoading, data }: Props) {
  return (
    <div>
      <h1>TransactionList</h1>
      <div>
        {isLoading && <div>loading...</div>}
        {JSON.stringify(data)}
      </div>
    </div>
  );
}
