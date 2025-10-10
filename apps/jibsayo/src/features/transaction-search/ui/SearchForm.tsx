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
import { cn } from '@package/utils';

import { SearchForm as SearchFormType } from '../models/types';

interface SearchFormProps {
  form: SearchFormType;
  favoriteRegionList: string[];
  onAddFavoriteRegion: (regionCode: string) => void;
  onRemoveFavoriteRegion: (regionCode: string) => void;
  onChangeForm: (value: Partial<SearchFormType>) => void;
}

export function SearchForm({
  form,
  favoriteRegionList,
  onAddFavoriteRegion,
  onRemoveFavoriteRegion,
  onChangeForm,
}: SearchFormProps) {
  const savedFavoriteRegion = favoriteRegionList.includes(form.regionCode);

  const isFavoritedRegion = (regionCode: string) => {
    return favoriteRegionList.includes(regionCode);
  };

  const sortedRegionList = () => {
    const allRegionList = getRegionsWithCityName(form.cityName);
    const favoritedRegionList = allRegionList.filter(region =>
      isFavoritedRegion(region.code)
    );
    const notFavoritedRegionList = allRegionList.filter(
      region => !isFavoritedRegion(region.code)
    );
    return [...favoritedRegionList, ...notFavoritedRegionList];
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:gap-x-2">
      <div className="flex gap-2">
        <Select
          value={form.cityName}
          onValueChange={cityName => onChangeForm({ cityName })}
        >
          <SelectTrigger className="flex-1 sm:w-[150px]">
            <SelectValue placeholder="시/도 선택">{form.cityName}</SelectValue>
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
          onValueChange={regionCode => onChangeForm({ regionCode })}
        >
          <SelectTrigger className="flex-1 sm:w-[150px]">
            <SelectValue placeholder="시/군/구 선택">
              {getRegionNameWithRegionCode(form.regionCode)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {sortedRegionList().map(region => {
              const isFavorited = isFavoritedRegion(region.code);
              return (
                <SelectItem key={region.code} value={region.code}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={isFavorited ? 'font-bold' : ''}>
                      {region.name}
                    </span>
                    {isFavorited && (
                      <span
                        onClick={e => {
                          if (isFavorited) {
                            onRemoveFavoriteRegion(region.code);
                          } else {
                            onAddFavoriteRegion(region.code);
                          }
                        }}
                      >
                        <Star
                          className={cn(
                            'h-4 w-4 translate-y-[-0.5px]',
                            isFavorited
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-300 text-gray-300'
                          )}
                        />
                      </span>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {savedFavoriteRegion && (
          <Button
            type="button"
            variant="warning"
            onClick={() => onRemoveFavoriteRegion(form.regionCode)}
          >
            저장됨
          </Button>
        )}
        {!savedFavoriteRegion && (
          <Button
            type="button"
            variant="warning"
            onClick={() => onAddFavoriteRegion(form.regionCode)}
          >
            저장
          </Button>
        )}
      </div>
      <MonthPicker
        value={form.tradeDate}
        onChange={tradeDate => onChangeForm({ tradeDate })}
      />
    </div>
  );
}
