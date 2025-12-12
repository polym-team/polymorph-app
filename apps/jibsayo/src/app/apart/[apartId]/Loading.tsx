import { ApartInfo } from '@/features/apart-info';
import { ApartTransactionList } from '@/features/apart-transaction-list';

import { Layout } from './Layout';

export async function Loading() {
  return (
    <Layout>
      <ApartInfo apartId={-1} data={undefined} />
      <ApartTransactionList apartId={-1} />
    </Layout>
  );
}
