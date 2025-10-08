import {
  cityNameList,
  getRegionNameWithRegionCode,
  getRegionsWithCityName,
} from '@/entities/region';

import {
  MonthPicker,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@package/ui';

import { SearchForm as SearchFormType } from '../models/types';

interface SearchFormProps {
  form: SearchFormType;
  onChangeForm: (value: Partial<SearchFormType>) => void;
}

export function SearchForm({ form, onChangeForm }: SearchFormProps) {
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
            {getRegionsWithCityName(form.cityName).map(region => (
              <SelectItem key={region.code} value={region.code}>
                {region.name}
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
