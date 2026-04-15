'use client';

import { ROUTE_PATH } from '@/shared/consts/route';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SearchBar() {
  const router = useRouter();

  return (
    <div
      className="relative cursor-pointer"
      onClick={() => router.push(ROUTE_PATH.SEARCH)}
    >
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
        size={20}
      />
      <div className="w-full rounded-lg bg-gray-100 p-4 pl-10 text-gray-400">
        아파트 이름으로 검색해보세요
      </div>
    </div>
  );
}
