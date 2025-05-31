'use client';

import { useState } from 'react';

import {
  Button,
  MonthPicker,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@package/ui';

export function SearchForm() {
  const [selectedMonth, setSelectedMonth] = useState<Date>();

  return (
    <div className="flex gap-x-2">
      <Select>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="시/도 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">서울시</SelectItem>
          <SelectItem value="banana">경기도</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="시/군/구 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">강동구</SelectItem>
          <SelectItem value="banana">동작구</SelectItem>
        </SelectContent>
      </Select>
      <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
      <Button variant="primary">검색</Button>
      <Button variant="outline">즐겨찾기</Button>
    </div>
  );
}
