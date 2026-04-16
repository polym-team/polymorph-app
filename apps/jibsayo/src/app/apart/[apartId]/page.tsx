import { PageLayout } from '@/widgets/ui/page-layout/PageLayout';

import { Metadata } from 'next';
import { Suspense } from 'react';

import { Content } from './Content';
import { Loading } from './Loading';
import { calculateApartId, fetchApartInfo } from './services';

interface ApartByTokenPageRequest {
  params: { apartId: string };
}

export async function generateMetadata({
  params,
}: ApartByTokenPageRequest): Promise<Metadata> {
  const apartId = calculateApartId(params.apartId);
  if (!apartId) return {};

  const data = await fetchApartInfo(apartId);
  if (!data) return {};

  const title = `${data.apartName} 실거래가 - ${data.dong} | 집사요`;
  const description = `${data.dong} ${data.apartName}의 실거래가, 시세 추이, 거래내역을 확인하세요. ${data.buildYear}년 준공, ${data.householdCount ? `${data.householdCount}세대` : ''}`;

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/apart/${params.apartId}`,
      siteName: '집사요',
      type: 'website',
      locale: 'ko_KR',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default function ApartByTokenPage({ params }: ApartByTokenPageRequest) {
  const { apartId } = params;

  return (
    <PageLayout showBackButton bgColor="gray">
      <Suspense fallback={<Loading />}>
        <Content apartId={apartId} />
      </Suspense>
    </PageLayout>
  );
}
