'use client';

import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import { ROUTE_PATH } from '@/shared/consts/route';
import { useIsClient } from '@/shared/hooks/useIsClient';

import { X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@package/ui';

interface Props {
  favoriteRegions: string[];
  onRemoveFavoriteRegion: (regionCode: string) => void;
  isLoading?: boolean;
}

export function FavoriteRegionList({
  favoriteRegions,
  onRemoveFavoriteRegion,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isClient = useIsClient();

  const handleSelectRegion = (regionCode: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('regionCode', regionCode);

    if (!params.get('tradeDate')) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      params.set('tradeDate', `${year}${month}`);
    }

    router.push(`${ROUTE_PATH.TRANSACTIONS}?${params.toString()}`);
  };

  const handleRemoveRegion = (region: string) => {
    onRemoveFavoriteRegion(region);
  };

  if (!isClient) {
    return (
      <div className="flex gap-x-1">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="flex h-[30px] flex-shrink-0 animate-pulse rounded-md bg-gray-200"
            style={{ width: `${80 + index * 20}px` }}
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex gap-x-1 overflow-x-auto [&::-webkit-scrollbar]:hidden"
      style={{
        scrollbarWidth: 'none' /* Firefox */,
        msOverflowStyle: 'none' /* IE and Edge */,
      }}
    >
      {favoriteRegions.map(regionCode => (
        <div
          key={regionCode}
          className="border-input bg-background flex flex-shrink-0 rounded-md border"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSelectRegion(regionCode)}
            className="whitespace-nowrap rounded-r-none border-0 px-3 py-1.5 text-sm"
          >
            <span className="translate-y-[-0.5px]">
              {getCityNameWithRegionCode(regionCode)}{' '}
              {getRegionNameWithRegionCode(regionCode)}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveRegion(regionCode)}
            className="h-full min-w-0 rounded-l-none border-0 px-2 py-1.5"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
