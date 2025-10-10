import {
  cityNameList,
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
  getRegionsWithCityName,
} from '@/entities/region';

import { Star } from 'lucide-react';
import { useMemo } from 'react';

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
import {
  calculateFavoriteRegionList,
  calculateNotFavoritedRegionList,
} from '../services/calculator';

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

  const favoriteRegionItems = useMemo(() => {
    return calculateFavoriteRegionList(favoriteRegionList);
  }, [favoriteRegionList]);

  const notFavoriteRegionItems = useMemo(() => {
    const allRegionList = getRegionsWithCityName(form.cityName);
    return calculateNotFavoritedRegionList(favoriteRegionList, allRegionList);
  }, [favoriteRegionList, form.cityName]);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:gap-x-2">
      <div className="flex gap-2">
        <Select
          value={form.cityName}
          onValueChange={cityName =>
            onChangeForm({
              cityName,
              regionCode: getRegionsWithCityName(cityName)[0].code,
            })
          }
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
          onValueChange={regionCode =>
            onChangeForm({
              cityName: getCityNameWithRegionCode(regionCode),
              regionCode,
            })
          }
        >
          <SelectTrigger className="flex-1 sm:w-[150px]">
            <SelectValue placeholder="시/군/구 선택">
              {getRegionNameWithRegionCode(form.regionCode)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {favoriteRegionItems.map(region => (
              <SelectItem key={region.code} value={region.code}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold">{region.name}</span>
                  <span
                    onClick={() => {
                      onRemoveFavoriteRegion(region.code);
                    }}
                  >
                    <Star
                      className={cn(
                        'h-4 w-4 translate-y-[-0.5px]',
                        'fill-yellow-400 text-yellow-400'
                      )}
                    />
                  </span>
                </div>
              </SelectItem>
            ))}
            {notFavoriteRegionItems.map(region => (
              <SelectItem key={region.code} value={region.code}>
                {region.name}
              </SelectItem>
            ))}
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
