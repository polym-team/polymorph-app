import { PageLayout } from '@/widgets/ui/page-layout/PageLayout';

import { Suspense } from 'react';

import ApartDetailContent from './ApartDetailContent';
import ApartDetailSkeleton from './ApartDetailSkeleton';

interface ApartDetailPageRequest {
  params: { token: string };
}

export default function ApartDetailPage({ params }: ApartDetailPageRequest) {
  const { token } = params;

  return (
    <PageLayout showBackButton bgColor="gray">
      <Suspense fallback={<ApartDetailSkeleton />}>
        <ApartDetailContent token={token} />
      </Suspense>
    </PageLayout>
  );
}
