'use client';

import { ROUTE_PATH } from '@/shared/consts/route';

import { Heart, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@package/ui';

export function EmptyList() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center gap-y-4 px-4 py-12 lg:py-20">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
        <Heart size={24} className="text-gray-400" />
      </div>
      <div className="text-center">
        <p className="text-base font-medium text-gray-800">
          아직 등록한 관심 아파트가 없어요
        </p>
        <p className="mt-1 text-sm text-gray-500">
          관심 있는 아파트를 검색하고 저장해보세요
        </p>
      </div>
      <Button
        variant="primary"
        onClick={() => router.push(ROUTE_PATH.SEARCH)}
        className="flex items-center gap-1.5"
      >
        <Search size={14} />
        아파트 검색하러 가기
      </Button>
    </div>
  );
}
