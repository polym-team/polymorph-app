import { ApartInfo } from '@/features/apart-info';
import { ApartTransactionList } from '@/features/apart-transaction-list';

import { Error } from './Error';
import { Layout } from './Layout';
import { fetchApartInfo } from './services';

interface ContentProps {
  apartToken: string;
}

export async function Content({ apartToken }: ContentProps) {
  const data = await fetchApartInfo(apartToken);

  if (!data) {
    return <Error />;
  }

  return (
    <Layout>
      <ApartInfo data={data} />
      <ApartTransactionList apartToken={apartToken} data={data} />
    </Layout>
  );
}
