import { ApartInfo } from '@/features/apart-info';

import { ApartError } from './ApartError';
// import { ApartTransactionList } from '@/features/apart-transaction-list';

import { Layout } from './Layout';
import { fetchApartInfo } from './services';

interface ApartContentProps {
  token: string;
}

export async function ApartContent({ token }: ApartContentProps) {
  const data = await fetchApartInfo(token);

  if (!data) {
    return <ApartError />;
  }

  return (
    <Layout>
      <ApartInfo data={data} />
      {/* <ApartTransactionList data={data} /> */}
    </Layout>
  );
}
