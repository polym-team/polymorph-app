import { ApartDetailInfo } from '@/features/apart-detail-info';
import { ROUTE_PATH } from '@/shared/consts/route';

import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { fetchApartDetail } from './services';
import { Skeleton } from './Skeleton';

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
    <Suspense fallback={<Skeleton />}>
      {(async () => {
        const data = await fetchApartDetail(regionCode, apartName);

        if (!data) {
          redirect(ROUTE_PATH.TRANSACTION);
        }

        return (
          <ApartDetailInfo
            data={data}
            regionCode={regionCode}
            apartName={decodedApartName}
          />
        );
      })()}
    </Suspense>
  );
}
