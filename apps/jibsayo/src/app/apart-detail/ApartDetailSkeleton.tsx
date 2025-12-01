import { ApartInfo } from '@/features/apart-info';

import { Layout } from './Layout';

export default async function ApartDetailSkeleton() {
  return (
    <Layout>
      <ApartInfo data={undefined} />
    </Layout>
  );
}
