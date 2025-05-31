'use client';

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

export function SearchForm() {
  const router = useRouter();
  const { form, setForm } = useSearchForm();

  const handleChangeDate = (nextDate: Date | undefined) => {
    if (nextDate) {
      setForm(prev => ({ ...prev, date: nextDate }));
    }
  };

  const handleChangeRegionCode = (nextRegionCode: string) => {
    setForm(prev => ({ ...prev, regionCode: nextRegionCode }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const year = form.date.getFullYear();
    const month = String(form.date.getMonth() + 1).padStart(2, '0');

    router.push(
      `/transaction?regionCode=${form.regionCode}&tradeDate=${year + month}`
    );
  };

  return (
    <form className="flex gap-x-2" onSubmit={handleSubmit}>
      <Select>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="시/도 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">서울시</SelectItem>
          <SelectItem value="banana">경기도</SelectItem>
        </SelectContent>
      </Select>
      <Select value={form.regionCode} onValueChange={handleChangeRegionCode}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="시/군/구 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="11740">강동구</SelectItem>
          <SelectItem value="11590">동작구</SelectItem>
        </SelectContent>
      </Select>
      <MonthPicker value={form.date} onChange={handleChangeDate} />
      <Button type="submit" variant="primary">
        검색
      </Button>
      <Button type="button" variant="outline">
        즐겨찾기
      </Button>
    </form>
  );
}
