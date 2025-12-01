import { ApartInfo } from '@/features/apart-info';
import { ApartTransactionList } from '@/features/apart-transaction-list';
import { ROUTE_PATH } from '@/shared/consts/route';

import { redirect } from 'next/navigation';

import { Layout } from './Layout';
import { fetchApartDetail } from './services';

interface ApartDetailContentProps {
  regionCode: string;
  decodedApartName: string;
}

export default async function ApartDetailContent({
  regionCode,
  decodedApartName,
}: ApartDetailContentProps) {
  const data = await fetchApartDetail(regionCode, decodedApartName);

  if (!data) {
    redirect(ROUTE_PATH.TRANSACTION);
  }

  return (
    <Layout>
      <ApartInfo data={data} />
      <ApartTransactionList data={data} />
    </Layout>
  );
}
