'use client';

import { X } from 'lucide-react';

import { Button } from '@package/ui';

export function FavoriteRegionList() {
  const handleSelectRegion = (region: string) => {
    // 지역 선택 로직 구현 예정
    console.log('Select region:', region);
  };

  const handleRemoveRegion = (region: string) => {
    // 지역 삭제 로직 구현 예정
    console.log('Remove region:', region);
  };

  return (
    <div className="flex gap-x-1">
      <div className="border-input bg-background flex rounded-md border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSelectRegion('서울시 강동구')}
          className="rounded-r-none border-0 px-3 py-1.5 text-sm"
        >
          서울시 강동구
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRemoveRegion('서울시 강동구')}
          className="h-full min-w-0 rounded-l-none border-0 px-2 py-1.5"
          aria-label="서울시 강동구 삭제"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      <div className="border-input bg-background flex items-center rounded-md border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSelectRegion('서울시 동작구')}
          className="rounded-r-none border-0 px-3 py-1.5 text-sm"
        >
          서울시 동작구
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRemoveRegion('서울시 동작구')}
          className="h-full min-w-0 rounded-l-none border-0 px-2 py-1.5"
          aria-label="서울시 동작구 삭제"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
