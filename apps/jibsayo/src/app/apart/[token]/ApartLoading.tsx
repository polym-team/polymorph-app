import { ApartInfo } from '@/features/apart-info';

import { Layout } from './Layout';

export async function ApartLoading() {
  return (
    <Layout>
      <ApartInfo data={undefined} />
    </Layout>
  );
}
