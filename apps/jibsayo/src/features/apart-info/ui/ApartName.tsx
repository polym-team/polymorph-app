import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import { PageContainer } from '@/shared/ui/PageContainer';

import { Star } from 'lucide-react';

import { cn } from '@package/utils';

import { ApartInfoType } from '../type';

interface ApartNameProps {
  data?: ApartInfoType;
  apartId: number;
  isFavorited: boolean;
  onFavoriteToggle: () => void;
}

export function ApartName({
  data,
  apartId,
  isFavorited,
  onFavoriteToggle,
}: ApartNameProps) {
  if (!data) {
    return (
      <PageContainer bgColor="white" className="py-4">
        <div className="flex items-start justify-between gap-x-0">
          <div className="flex flex-col gap-y-1">
            <div className="h-7 w-48 animate-pulse rounded bg-gray-200 lg:h-8" />
            <div className="h-5 w-32 animate-pulse rounded bg-gray-200 lg:h-6" />
          </div>
          <div className="h-6 w-6 animate-pulse rounded-full bg-gray-200" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer bgColor="white" className="pb-4 pt-6">
      <div className="flex flex-col gap-y-1">
        <div className="flex items-center gap-x-2">
          <span className="text-xl font-semibold lg:text-2xl">
            {data.apartName}
          </span>
          {apartId && (
            <button className="-translate-y-[1px]" onClick={onFavoriteToggle}>
              <Star
                size={20}
                className={cn(
                  isFavorited
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-300 text-gray-300'
                )}
              />
            </button>
          )}
        </div>
        <span className="text-sm text-gray-400 lg:text-base">
          {getCityNameWithRegionCode(data.regionCode)}{' '}
          {getRegionNameWithRegionCode(data.regionCode)} {data.dong}
        </span>
      </div>
    </PageContainer>
  );
}
