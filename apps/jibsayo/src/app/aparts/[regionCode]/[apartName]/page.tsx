import { ApartDetailResponse } from '@/app/api/apart/types';
import { ApartDetail } from '@/features/apart-detail';
import { LoadingFallback } from '@/features/apart-detail/ui/LoadingFallback';

import { Suspense } from 'react';

interface Props {
  params: {
    regionCode: string;
    apartName: string;
  };
}

async function getApartDetail(
  apartName: string,
  regionCode: string
): Promise<ApartDetailResponse | null> {
  try {
    const response = await fetch(
      `${process.env.BASE_URL}/api/apart?apartName=${encodeURIComponent(
        apartName
      )}&area=${regionCode}`
    );

    if (response.ok) {
      return response.json();
    }

    return null;
  } catch (error) {
    console.error('아파트 데이터 조회 실패:', error);
    return null;
  }
}

export default function ApartDetailPage({ params }: Props) {
  const { apartName, regionCode } = params;
  const decodedApartName = decodeURIComponent(apartName);

  if (!decodedApartName || !regionCode) {
    return null;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      {(async () => {
        const data = await getApartDetail(apartName, regionCode);

        if (!data) {
          return null;
        }

        return (
          <ApartDetail
            data={data}
            apartName={decodedApartName}
            regionCode={regionCode}
          />
        );
      })()}
    </Suspense>
  );
}
