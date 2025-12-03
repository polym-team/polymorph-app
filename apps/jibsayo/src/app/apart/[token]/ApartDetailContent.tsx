import { getApartByApartToken } from '@/app/api/apartments/[token]/service';
import { parseApartToken } from '@/app/api/shared/services/transaction/service';
import { ApartInfo } from '@/features/apart-info';
// import { ApartTransactionList } from '@/features/apart-transaction-list';
import { ROUTE_PATH } from '@/shared/consts/route';

import { redirect } from 'next/navigation';

import { Layout } from './Layout';

interface ApartDetailContentProps {
  token: string;
}

export default async function ApartDetailContent({
  token,
}: ApartDetailContentProps) {
  const parsedToken = parseApartToken(token);
  if (!parsedToken) {
    redirect(ROUTE_PATH.TRANSACTION);
  }

  const data = await getApartByApartToken(token);
  if (!data) {
    redirect(ROUTE_PATH.TRANSACTION);
  }

  return (
    <Layout>
      <ApartInfo data={data} />
      {/* <ApartTransactionList data={data} /> */}
    </Layout>
  );
}
