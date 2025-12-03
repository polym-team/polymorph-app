import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import { PageContainer } from '@/shared/ui/PageContainer';

import { ApartInfoType } from '../type';

interface ApartNameProps {
  data: ApartInfoType;
}

export function ApartName({ data }: ApartNameProps) {
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
