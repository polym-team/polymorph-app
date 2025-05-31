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
      {['서울시 강동구', '서울시 동작구'].map(text => (
        <div className="border-input bg-background flex rounded-md border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSelectRegion(text)}
            className="rounded-r-none border-0 px-3 py-1.5 text-sm"
          >
            <span className="translate-y-[-0.5px]">{text}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveRegion(text)}
            className="h-full min-w-0 rounded-l-none border-0 px-2 py-1.5"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
