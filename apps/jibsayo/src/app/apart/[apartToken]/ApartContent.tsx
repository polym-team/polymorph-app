import { ApartInfo } from '@/features/apart-info';
import { ApartTransactionList } from '@/features/apart-transaction-list';

import { ApartError } from './ApartError';
import { Layout } from './Layout';
import { fetchApartInfo } from './services';

interface ApartContentProps {
  apartToken: string;
}

export async function ApartContent({ apartToken }: ApartContentProps) {
  const data = await fetchApartInfo(apartToken);

  if (!data) {
    return <ApartError />;
  }

  return (
    <Layout>
      <ApartInfo data={data} />
      <ApartTransactionList apartToken={apartToken} data={data} />
    </Layout>
  );
}
