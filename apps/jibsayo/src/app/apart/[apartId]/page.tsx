import { PageLayout } from '@/widgets/ui/page-layout/PageLayout';

import { Suspense } from 'react';

import { Content } from './Content';
import { Loading } from './Loading';

interface ApartByTokenPageRequest {
  params: { apartId: string };
  searchParams: { fallbackToken?: string };
}

export default function ApartByTokenPage({
  params,
  searchParams,
}: ApartByTokenPageRequest) {
  const { apartId } = params;
  const { fallbackToken } = searchParams;

  return (
    <PageLayout showBackButton bgColor="gray">
      <Suspense fallback={<Loading />}>
        <Content apartId={apartId} fallbackToken={fallbackToken} />
      </Suspense>
    </PageLayout>
  );
}
