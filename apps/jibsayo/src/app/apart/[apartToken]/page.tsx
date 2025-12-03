import { PageLayout } from '@/widgets/ui/page-layout/PageLayout';

import { Suspense } from 'react';

import { ApartContent } from './ApartContent';
import { ApartLoading } from './ApartLoading';

interface ApartDetailPageRequest {
  params: { apartToken: string };
}

export default function ApartDetailPage({ params }: ApartDetailPageRequest) {
  const { apartToken } = params;

  return (
    <PageLayout showBackButton bgColor="gray">
      <Suspense fallback={<ApartLoading />}>
        <ApartContent apartToken={apartToken} />
      </Suspense>
    </PageLayout>
  );
}
