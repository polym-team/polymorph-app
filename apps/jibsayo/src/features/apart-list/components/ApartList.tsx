'use client';

import { useFavoriteApartList } from '@/entities/apart';
import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';

import { FolderOpen, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button, Card, Typography } from '@package/ui';

export function ApartList() {
  const router = useRouter();
  const { favoriteApartList, removeFavoriteApart } = useFavoriteApartList();

  const handleClickApart = (apartName: string) => {
    router.push(`/apart/${apartName}`);
  };

  const handleRemoveApart = (regionCode: string, apartId: string) => {
    removeFavoriteApart(regionCode, apartId);
  };

  if (favoriteApartList.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-4 py-16">
        <Typography>저장된 아파트가 없습니다.</Typography>
        <Button variant="outline" onClick={() => router.push('/transaction')}>
          실거래가 목록 보기
        </Button>
      </Card>
    );
  }

  return (
    <div>
      {favoriteApartList.map(apart => (
        <div key={apart.regionCode}>
          <Card className="flex flex-col">
            <Typography variant="small" className="p-5">
              {getCityNameWithRegionCode(apart.regionCode)}{' '}
              {getRegionNameWithRegionCode(apart.regionCode)}{' '}
              <strong className="text-primary">
                ({apart.apartItems.length})
              </strong>
            </Typography>
            <hr className="my-0 border-gray-200" />
            <div className="flex flex-wrap gap-2 p-4">
              {apart.apartItems.map(item => (
                <div
                  key={item.apartId}
                  className="border-input bg-background flex flex-shrink-0 rounded-md border"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleClickApart(item.apartName)}
                    className="whitespace-nowrap rounded-r-none border-0 px-3 py-1.5 text-sm"
                  >
                    <span className="translate-y-[-0.5px]">
                      {item.apartName}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleRemoveApart(apart.regionCode, item.apartId)
                    }
                    className="h-full min-w-0 rounded-l-none border-0 px-2 py-1.5"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}
