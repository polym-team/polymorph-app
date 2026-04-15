'use client';

import { useFavoriteApartListQuery } from '@/entities/apart/hooks/useFavoriteApartListQuery';
import { ROUTE_PATH } from '@/shared/consts/route';
import { PageContainer } from '@/shared/ui/PageContainer';

import { ChevronRight, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function MyFavorites() {
  const { data: favorites } = useFavoriteApartListQuery();
  const router = useRouter();

  if (!favorites || favorites.length === 0) return null;

  return (
    <PageContainer>
      <button
        className="mb-2 flex w-full items-center justify-between"
        onClick={() => router.push(ROUTE_PATH.FAVORITES)}
      >
        <h2 className="flex items-center gap-1.5 text-base font-bold">
          <Heart size={16} className="text-red-400" fill="currentColor" />
          내 관심 아파트
          <span className="text-sm font-normal text-gray-400">
            {favorites.length}
          </span>
        </h2>
        <ChevronRight size={18} className="text-gray-400" />
      </button>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {favorites.slice(0, 5).map(apt => (
          <button
            key={apt.apartId}
            onClick={() => router.push(`${ROUTE_PATH.APART}/${apt.apartId}`)}
            className="flex-shrink-0 rounded-lg border bg-white px-3 py-2 text-left transition hover:border-blue-200 hover:bg-blue-50"
          >
            <div className="text-sm font-medium">{apt.apartName}</div>
          </button>
        ))}
        {favorites.length > 5 && (
          <button
            onClick={() => router.push(ROUTE_PATH.FAVORITES)}
            className="flex flex-shrink-0 items-center rounded-lg border px-3 py-2 text-xs text-gray-400"
          >
            +{favorites.length - 5}개 더보기
          </button>
        )}
      </div>
    </PageContainer>
  );
}
