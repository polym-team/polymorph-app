import { ApartDetail } from '@/features/apart-detail';
import { LoadingFallback } from '@/features/apart-detail/ui/LoadingFallback';

import { Suspense } from 'react';

import { getApartDetail } from './service';

interface Props {
  params: {
    apartName: string;
  };
}

export default function ApartDetailPage({ params }: Props) {
  const { apartName } = params;
  const decodedApartName = decodeURIComponent(apartName);

  if (!decodedApartName) {
    return null;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      {(async () => {
        const data = await getApartDetail(apartName);

        if (!data) {
          return null;
        }

        return <ApartDetail data={data} apartName={decodedApartName} />;
      })()}
    </Suspense>
  );
}
