import { PageLayout } from '@/widgets/ui/page-layout/PageLayout';

import { Suspense } from 'react';

import { Content } from './Content';
import { Loading } from './Loading';

interface ApartByTokenPageRequest {
  params: { apartId: string };
}

export default function ApartByTokenPage({ params }: ApartByTokenPageRequest) {
  const { apartId } = params;

  return (
    <PageLayout showBackButton bgColor="gray">
      <Suspense fallback={<Loading />}>
        <Content apartId={apartId} />
      </Suspense>
    </PageLayout>
  );
}
