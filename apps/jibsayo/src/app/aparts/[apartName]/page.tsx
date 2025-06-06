import { LoadingFallback } from '@/features/apart-detail/ui/LoadingFallback';

import { Suspense } from 'react';

import { ApartDetailContainer } from './ApartDetailContainer';

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
      <ApartDetailContainer apartName={decodedApartName} />
    </Suspense>
  );
}
