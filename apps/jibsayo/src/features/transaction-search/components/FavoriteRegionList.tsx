'use client';

import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';

import { Star, X } from 'lucide-react';

import { Button } from '@package/ui';

import { useFavoriteRegion } from '../hooks/useFavoriteRegion';
import { SearchForm } from '../models/types';

interface Props {
  form: SearchForm;
  onSubmit: (nextForm?: Partial<SearchForm>) => void;
}

export function FavoriteRegionList({ form, onSubmit }: Props) {
  const { favoriteRegions, addFavoriteRegion, removeFavoriteRegion } =
    useFavoriteRegion();

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
      <Button
        variant="outline"
        size="sm"
        className="flex-shrink-0 whitespace-nowrap px-3 py-1.5 text-sm"
        onClick={() => addFavoriteRegion(form.regionCode)}
      >
        <Star className="h-3 w-3 translate-y-[0.5px]" />
        즐겨찾기에 추가
      </Button>
      {favoriteRegions.map(regionCode => (
        <div
          key={regionCode}
          className="border-input bg-background flex flex-shrink-0 rounded-md border"
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
