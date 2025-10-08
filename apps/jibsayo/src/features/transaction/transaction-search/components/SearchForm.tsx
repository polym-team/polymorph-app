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

import { useSearchForm } from '../hooks/useSearchForm';

export function SearchForm() {
  const {
    form,
    updateCityName,
    updateRegionCode,
    updateTradeDate,
    submitForm,
  } = useSearchForm();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitForm();
  };

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row sm:gap-x-2"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-x-2">
        <div className="flex gap-2">
          <Select value={form.cityName} onValueChange={updateCityName}>
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
          <Select value={form.regionCode} onValueChange={updateRegionCode}>
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
        <MonthPicker value={form.tradeDate} onChange={updateTradeDate} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="primary" className="flex-1 sm:flex-none">
          검색
        </Button>
        <Button
          type="button"
          variant="warning"
          className="flex-shrink-0"
          onClick={() => {
            // FIXME: 작업 필요
          }}
        >
          저장
        </Button>
      </div>
    </form>
  );
}
