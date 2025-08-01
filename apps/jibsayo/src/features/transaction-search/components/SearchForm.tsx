'use client';

import {
  cityNameList,
  getRegionNameWithRegionCode,
  getRegionsWithCityName,
} from '@/entities/region';

import { Star } from 'lucide-react';

import {
  Button,
  MonthPicker,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@package/ui';

import { SearchForm as SearchFormType } from '../models/types';

interface Props {
  form: SearchFormType;
  updateCityName: (nextCityName: string) => void;
  updateRegionCode: (nextRegionCode: string) => void;
  updateDate: (nextDate: Date) => void;
  onSubmit: () => void;
  favoriteRegions: string[];
  toggleFavoriteRegion: (regionCode: string) => void;
}

export function SearchForm({
  form,
  updateCityName,
  updateRegionCode,
  updateDate,
  onSubmit,
  favoriteRegions,
  toggleFavoriteRegion,
}: Props) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  };

  const isCurrentRegionFavorite = form.regionCode
    ? favoriteRegions.includes(form.regionCode)
    : false;

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row sm:gap-x-2"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-x-2">
        <div className="flex gap-2">
          <Select
            value={form.cityName}
            onValueChange={value => updateCityName(value)}
          >
            <SelectTrigger className="flex-1 sm:w-[150px]">
              <SelectValue placeholder="시/도 선택">
                {form.cityName}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {cityNameList.map(cityName => (
                <SelectItem key={cityName} value={cityName}>
                  {cityName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={form.regionCode}
            onValueChange={value => updateRegionCode(value)}
          >
            <SelectTrigger className="flex-1 sm:w-[150px]">
              <SelectValue placeholder="시/군/구 선택">
                {getRegionNameWithRegionCode(form.regionCode)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {getRegionsWithCityName(form.cityName).map(region => (
                <SelectItem key={region.code} value={region.code}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <MonthPicker
          value={form.date}
          onChange={nextDate => updateDate(nextDate ?? new Date())}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="primary" className="flex-1 sm:flex-none">
          검색
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-[37px] w-[37px] flex-shrink-0"
          onClick={() => toggleFavoriteRegion(form.regionCode)}
        >
          <Star
            className={`h-5 w-5 ${
              isCurrentRegionFavorite
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-300 text-gray-300'
            }`}
          />
        </Button>
      </div>
    </form>
  );
}
