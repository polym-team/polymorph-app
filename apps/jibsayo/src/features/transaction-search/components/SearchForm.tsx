'use client';

import {
  cityNameList,
  getRegionNameWithRegionCode,
  getRegionsWithCityName,
} from '@/entities/region';

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
}

export function SearchForm({
  form,
  updateCityName,
  updateRegionCode,
  updateDate,
  onSubmit,
}: Props) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  };

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
      <Button type="submit" variant="primary" className="flex-1 sm:flex-none">
        검색
      </Button>
    </form>
  );
}
