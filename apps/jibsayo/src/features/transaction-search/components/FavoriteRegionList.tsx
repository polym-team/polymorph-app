'use client';

import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';

import { X } from 'lucide-react';

import { Button } from '@package/ui';

import { SearchForm } from '../models/types';

interface Props {
  form: SearchForm;
  onSubmit: (nextForm?: Partial<SearchForm>) => void;
  favoriteRegions: string[];
  removeFavoriteRegion: (regionCode: string) => void;
}

export function FavoriteRegionList({
  form,
  onSubmit,
  favoriteRegions,
  removeFavoriteRegion,
}: Props) {
  const handleSelect = (regionCode: string) => {
    onSubmit({ regionCode });
  };

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
          className="border-input bg-background flex flex-shrink-0 rounded-sm border"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSelect(regionCode)}
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
            onClick={() => removeFavoriteRegion(regionCode)}
            className="h-full min-w-0 rounded-l-none border-0 px-2 py-1.5"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
