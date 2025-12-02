import { ROUTE_PATH } from '@/shared/consts/route';
import { PageLayout } from '@/widgets/ui/page-layout/PageLayout';

import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import ApartDetailContent from './ApartDetailContent';
import ApartDetailSkeleton from './ApartDetailSkeleton';

interface ApartDetailPageRequest {
  searchParams: {
    regionCode: string;
    apartName: string;
  };
}

export default function ApartDetailPage({
  searchParams,
}: ApartDetailPageRequest) {
  const { apartName, regionCode } = searchParams;
  const decodedApartName = decodeURIComponent(apartName);

  if (!decodedApartName || !regionCode) {
    redirect(ROUTE_PATH.TRANSACTION);
  }

  return (
    <PageLayout showBackButton bgColor="gray">
      <Suspense fallback={<ApartDetailSkeleton />}>
        <ApartDetailContent
          regionCode={regionCode}
          decodedApartName={decodedApartName}
        />
      </Suspense>
    </PageLayout>
  );
}
