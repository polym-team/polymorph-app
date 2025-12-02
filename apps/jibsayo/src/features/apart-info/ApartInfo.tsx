'use client';

import { ApartDetailResponse } from '@/app/api/apart/types';
import { PageContainer } from '@/shared/ui/PageContainer';

import { DetailInfo } from './ui/DetailInfo';
import { DetailInfoSkeleton } from './ui/DetailInfoSkeleton';
import { LocationInfo } from './ui/LocationInfo';
import { LocationInfoSkeleton } from './ui/LocationInfoSkeleton';

interface ApartInfoProps {
  data?: ApartDetailResponse;
}

export function ApartInfo({ data }: ApartInfoProps) {
  return (
    <PageContainer className="pb-6" bgColor="white">
      <div className="flex flex-col gap-y-5">
        {data && (
          <>
            <DetailInfo
              regionCode={data.regionCode}
              address={data.address}
              apartName={data.apartName}
              housholdsCount={data.housholdsCount}
              parking={data.parking}
              floorAreaRatio={data.floorAreaRatio}
              buildingCoverageRatio={data.buildingCoverageRatio}
            />
            <LocationInfo apartName={data.apartName} address={data.address} />
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
