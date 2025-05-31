'use client';

import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';

import { X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@package/ui';

interface Props {
  favoriteRegions: string[];
  onRemoveFavoriteRegion: (regionCode: string) => void;
}

export function FavoriteRegionList({
  favoriteRegions,
  onRemoveFavoriteRegion,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelectRegion = (regionCode: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('regionCode', regionCode);

    if (!params.get('tradeDate')) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      params.set('tradeDate', `${year}${month}`);
    }

    router.push(`/transaction?${params.toString()}`);
  };

  const handleRemoveRegion = (region: string) => {
    onRemoveFavoriteRegion(region);
  };

  return (
    <div className="flex gap-x-1">
      {favoriteRegions.map(regionCode => (
        <div
          key={regionCode}
          className="border-input bg-background flex rounded-md border"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSelectRegion(regionCode)}
            className="rounded-r-none border-0 px-3 py-1.5 text-sm"
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
