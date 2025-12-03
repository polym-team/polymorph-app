'use client';

import { PageContainer } from '@/shared/ui/PageContainer';

import { ApartInfoType } from './type';
import { DetailInfo } from './ui/DetailInfo';
import { DetailInfoSkeleton } from './ui/DetailInfoSkeleton';
import { LocationInfo } from './ui/LocationInfo';
import { LocationInfoSkeleton } from './ui/LocationInfoSkeleton';

interface ApartInfoProps {
  data?: ApartInfoType;
}

export function ApartInfo({ data }: ApartInfoProps) {
  return (
    <PageContainer className="pb-6" bgColor="white">
      <div className="flex flex-col gap-y-5">
        {data && (
          <>
            <DetailInfo data={data} />
            <LocationInfo apartName={data.apartName} dong={data.dong} />
          </>
        )}

        {!data && (
          <>
            <DetailInfoSkeleton />
            <LocationInfoSkeleton />
          </>
        )}
      </div>
    </PageContainer>
  );
}
