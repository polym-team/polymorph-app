import { ApartDetailSkeleton } from '@/features/apart-detail/ui/ApartDetailSkeleton';

import { Suspense } from 'react';

import { ApartDetailContainer } from './ApartDetailContainer';

interface Props {
  searchParams: {
    apartName?: string;
  };
}

export default function ApartPage({ searchParams }: Props) {
  const { apartName } = searchParams;

  if (!apartName) {
    return null;
  }

  return (
    <Suspense fallback={<ApartDetailSkeleton />}>
      <ApartDetailContainer apartName={apartName} />
    </Suspense>
  );
}
