import {
  cityNameList,
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
  getRegionsWithCityName,
} from '@/entities/region';

import { Star } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import {
  MonthPicker,
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
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
  const [regionSelectOpen, setRegionSelectOpen] = useState(false);
  const preventCloseRef = useRef(false);

  const favoriteRegionItems = useMemo(() => {
    return calculateFavoriteRegionList(favoriteRegionList);
  }, [favoriteRegionList]);

  const notFavoriteRegionItems = useMemo(() => {
    const allRegionList = getRegionsWithCityName(form.cityName);
    return calculateNotFavoritedRegionList(favoriteRegionList, allRegionList);
  }, [favoriteRegionList, form.cityName]);

  return (
    <div className="flex flex-col gap-2">
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
          <SelectTrigger className="flex-1">
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
          key={form.cityName}
          value={form.regionCode}
          open={regionSelectOpen}
          onOpenChange={open => {
            if (!open && preventCloseRef.current) {
              preventCloseRef.current = false;
              return;
            }
            setRegionSelectOpen(open);
          }}
          onValueChange={regionCode => {
            onChangeForm({
              cityName: getCityNameWithRegionCode(regionCode),
              regionCode,
            });
            setRegionSelectOpen(false);
          }}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="시/군/구 선택">
              {getRegionNameWithRegionCode(form.regionCode)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {favoriteRegionItems.map(region => (
              <SelectItem key={region.code} value={region.code}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold">{region.name}</span>
                  <button
                    type="button"
                    onMouseDown={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      preventCloseRef.current = true;
                      onRemoveFavoriteRegion(region.code);
                    }}
                    className="flex h-[20px] w-[20px] cursor-pointer items-center justify-center"
                  >
                    <Star
                      className={cn(
                        'h-4 w-4',
                        'fill-yellow-400 text-yellow-400'
                      )}
                    />
                  </button>
                </div>
              </SelectItem>
            ))}
            {favoriteRegionItems.length > 0 && <SelectSeparator />}
            {notFavoriteRegionItems.map(region => (
              <SelectItem key={region.code} value={region.code}>
                <div className="flex items-center justify-between gap-2">
                  {region.name}
                  <button
                    type="button"
                    onMouseDown={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      preventCloseRef.current = true;
                      onAddFavoriteRegion(region.code);
                    }}
                    className="flex h-[20px] w-[20px] cursor-pointer items-center justify-center"
                  >
                    <Star
                      className={cn('h-4 w-4', 'fill-gray-300 text-gray-300')}
                    />
                  </button>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <MonthPicker
        value={form.tradeDate}
        onChange={tradeDate => onChangeForm({ tradeDate })}
      />
    </div>
  );
}
