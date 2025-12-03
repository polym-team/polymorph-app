import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import { PageContainer } from '@/shared/ui/PageContainer';

import { ApartInfoType } from '../type';

interface ApartNameProps {
  data?: ApartInfoType;
}

export function ApartName({ data }: ApartNameProps) {
  if (!data) {
    return (
      <PageContainer bgColor="white" className="py-4">
        <div className="flex flex-col gap-y-1">
          <div className="h-7 w-48 animate-pulse rounded bg-gray-200 lg:h-8" />
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200 lg:h-6" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer bgColor="white" className="py-4">
      <div className="flex flex-col gap-y-1">
        <span className="text-xl font-semibold lg:text-2xl">
          {data.apartName}
        </span>
        <span className="text-sm text-gray-400 lg:text-base">
          {getCityNameWithRegionCode(data.regionCode)}{' '}
          {getRegionNameWithRegionCode(data.regionCode)} {data.dong}
        </span>
      </div>
    </PageContainer>
  );
}
