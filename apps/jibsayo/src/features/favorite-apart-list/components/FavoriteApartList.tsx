'use client';

import { useFavoriteApartList } from '@/entities/apart';
import { ApartItem } from '@/entities/apart/models/types';
import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import { LoadingFallback } from '@/features/apart-detail/ui/LoadingFallback';
import { ROUTE_PATH } from '@/shared/consts/route';
import { useIsClient } from '@/shared/hooks/useIsClient';

import { Home, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Button, Card, Typography } from '@package/ui';

export function FavoriteApartList() {
  const router = useRouter();
  const { favoriteApartList, removeFavoriteApart, refreshFavoriteApartList } =
    useFavoriteApartList();
  const isClient = useIsClient();

  // 페이지 포커스 시 즐겨찾기 목록 새로고침
  useEffect(() => {
    const handleFocus = () => {
      refreshFavoriteApartList();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshFavoriteApartList]);

  const handleClickApart = (apartName: string, regionCode: string) => {
    router.push(
      `${ROUTE_PATH.APARTS}/${regionCode}/${encodeURIComponent(apartName)}`
    );
  };

  const handleRemoveApart = async (
    regionCode: string,
    apartItem: ApartItem
  ) => {
    await removeFavoriteApart(regionCode, apartItem);
  };

  if (!isClient) {
    return <LoadingFallback />;
  }

  if (favoriteApartList.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-4 py-16">
        <Home className="h-8 w-8 text-gray-400" />
        <Typography>저장된 아파트가 없습니다.</Typography>
        <Button
          variant="outline"
          className="mt-5"
          onClick={() => router.push(ROUTE_PATH.TRANSACTIONS)}
        >
          실거래가 목록 보기
        </Button>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-y-5">
      {favoriteApartList.map(region => {
        const cityName = getCityNameWithRegionCode(region.regionCode);
        const regionName = getRegionNameWithRegionCode(region.regionCode);
        const fullRegionName =
          cityName && regionName ? `${cityName} ${regionName}` : '';

        return (
          <Card key={region.regionCode} className="p-3 md:p-5">
            <div className="mb-4 flex items-center justify-between">
              <Typography variant="large" className="font-semibold">
                {fullRegionName}
              </Typography>
            </div>
            <div className="flex flex-col gap-y-3">
              {region.apartItems.map(apart => (
                <div
                  key={`${apart.apartName}-${apart.address}`}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() =>
                      handleClickApart(apart.apartName, region.regionCode)
                    }
                  >
                    <Typography className="font-medium">
                      {apart.apartName}
                    </Typography>
                    <Typography variant="small" className="text-gray-500">
                      {apart.address}
                    </Typography>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveApart(region.regionCode, apart)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
