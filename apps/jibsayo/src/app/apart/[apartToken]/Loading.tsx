import { ApartInfo } from '@/features/apart-info';
import { ApartTransactionList } from '@/features/apart-transaction-list';

import { Layout } from './Layout';

export async function Loading() {
  return (
    <Layout>
      <ApartInfo data={undefined} />
      <ApartTransactionList apartToken="" data={undefined} />
    </Layout>
  );
}
