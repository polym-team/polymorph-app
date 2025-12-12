import { ApartInfo } from '@/features/apart-info';
import { ApartTransactionList } from '@/features/apart-transaction-list';

import { Error } from './Error';
import { Layout } from './Layout';
import { calculateApartId, fetchApartInfo } from './services';

interface ContentProps {
  apartId: string;
}

export async function Content({ apartId: apartIdParam }: ContentProps) {
  const apartId = calculateApartId(apartIdParam);
  const data = apartId ? await fetchApartInfo(apartId) : null;

  if (!apartId || !data) {
    return <Error />;
  }

  return (
    <Layout>
      <ApartInfo apartId={apartId} data={data} />
      <ApartTransactionList apartId={apartId} data={data} />
    </Layout>
  );
}
