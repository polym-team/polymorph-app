'use client';

import { cityNameList, getRegionsWithCityName } from '@/entities/region';

import { useRouter } from 'next/navigation';

import {
  Button,
  MonthPicker,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@package/ui';

import { useSearchForm } from '../hooks/useSearchForm';

interface Props {
  onAddFavoriteRegion: (regionCode: string) => void;
}

export function SearchForm({ onAddFavoriteRegion }: Props) {
  const router = useRouter();
  const {
    form,
    handleChangeCityName,
    handleChangeRegionCode,
    handleChangeDate,
  } = useSearchForm();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const year = form.date.getFullYear();
    const month = String(form.date.getMonth() + 1).padStart(2, '0');

    router.push(
      `/transaction?regionCode=${form.regionCode}&tradeDate=${year + month}`
    );
  };

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row sm:gap-x-2"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-x-2">
        <div className="flex gap-2">
          <Select value={form.cityName} onValueChange={handleChangeCityName}>
            <SelectTrigger className="flex-1 sm:w-[150px]">
              <SelectValue placeholder="시/도 선택" />
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
            onValueChange={handleChangeRegionCode}
          >
            <SelectTrigger className="flex-1 sm:w-[150px]">
              <SelectValue placeholder="시/군/구 선택" />
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
        <MonthPicker value={form.date} onChange={handleChangeDate} />
      </div>
      <div className="flex gap-2 sm:gap-x-2">
        <Button type="submit" variant="primary" className="flex-1 sm:flex-none">
          검색
        </Button>
        <Button
          type="button"
          variant="warning"
          className="flex-1 sm:flex-none"
          onClick={() => onAddFavoriteRegion(form.regionCode)}
        >
          즐겨찾기
        </Button>
      </div>
    </form>
  );
}
