import { PageLayout } from '@/widgets/ui/page-layout/PageLayout';

import { Suspense } from 'react';

import { ApartContent } from './ApartContent';
import { ApartLoading } from './ApartLoading';

interface ApartDetailPageRequest {
  params: { token: string };
}

export default function ApartDetailPage({ params }: ApartDetailPageRequest) {
  const { token } = params;

  return (
    <PageLayout showBackButton bgColor="gray">
      <Suspense fallback={<ApartLoading />}>
        <ApartContent token={token} />
      </Suspense>
    </PageLayout>
  );
}
