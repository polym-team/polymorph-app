'use client';

import { useState } from 'react';

import { MonthPicker } from '@package/ui';

export default function MonthPickerTestPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="mb-6 text-2xl font-bold">MonthPicker 테스트</h1>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">년월 선택</label>
          <MonthPicker
            value={selectedDate}
            onChange={setSelectedDate}
            placeholder="년월을 선택하세요"
          />
        </div>

        <div className="rounded bg-gray-100 p-4">
          <h3 className="mb-2 font-medium">선택된 값:</h3>
          <pre className="text-sm">
            {selectedDate
              ? `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월`
              : '선택되지 않음'}
          </pre>
        </div>
      </div>
    </div>
  );
}
