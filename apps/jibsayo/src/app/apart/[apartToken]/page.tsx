import { PageLayout } from '@/widgets/ui/page-layout/PageLayout';

import { Suspense } from 'react';

import { Content } from './Content';
import { Loading } from './Loading';

interface ApartDetailPageRequest {
  params: { apartToken: string };
}

export default function ApartDetailPage({ params }: ApartDetailPageRequest) {
  const { apartToken } = params;

  return (
    <PageLayout showBackButton bgColor="gray">
      <Suspense fallback={<Loading />}>
        <Content apartToken={apartToken} />
      </Suspense>
    </PageLayout>
  );
}
