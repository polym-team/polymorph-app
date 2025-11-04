import { ROUTE_PATH } from '@/shared/consts/route';
import {
  ApartDetailPageSkeleton,
  ApartDetailPageWidget,
} from '@/wigets/apart-detail';

import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { fetchApartDetail } from './services/api';

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
    <div className="flex flex-col gap-y-5">
      <Suspense fallback={<ApartDetailPageSkeleton />}>
        {(async () => {
          const data = await fetchApartDetail(regionCode, decodedApartName);

          if (!data) {
            redirect(ROUTE_PATH.TRANSACTION);
          }

          return <ApartDetailPageWidget data={data} />;
        })()}
      </Suspense>
    </div>
  );
}
