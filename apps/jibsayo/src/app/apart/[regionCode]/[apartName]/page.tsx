import { ROUTE_PATH } from '@/shared/consts/route';
import {
  ApartDetailPageSkeleton,
  ApartDetailPageWidget,
} from '@/wigets/apart-detail';

import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { fetchApartDetail } from './services';

interface ApartDetailPageRequest {
  params: {
    regionCode: string;
    apartName: string;
  };
}

export default function ApartDetailPage({ params }: ApartDetailPageRequest) {
  const { apartName, regionCode } = params;
  const decodedApartName = decodeURIComponent(apartName);

  if (!decodedApartName || !regionCode) {
    return null;
  }

  return (
    <div className="flex flex-col gap-y-5">
      <Suspense fallback={<ApartDetailPageSkeleton />}>
        {(async () => {
          const data = await fetchApartDetail(regionCode, apartName);
          if (!data) redirect(ROUTE_PATH.TRANSACTION);

          return <ApartDetailPageWidget data={data} />;
        })()}
      </Suspense>
    </div>
  );
}
