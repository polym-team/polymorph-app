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
            <div className="flex gap-2 p-4">
              {apart.apartItems.map(item => (
                <div key={item.apartId} className="flex">
                  <Button
                    variant="outline"
                    className="rounded-r-none"
                    onClick={() => handleClickApart(item.apartName)}
                  >
                    {item.apartName}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-l-none border-l-0 px-2"
                    onClick={() =>
                      handleRemoveApart(apart.regionCode, item.apartId)
                    }
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
