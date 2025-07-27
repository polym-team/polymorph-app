'use client';

import { ApartDetailResponse } from '@/app/api/apart/types';
import { useFavoriteApartList } from '@/entities/apart';
import { ApartItem } from '@/entities/apart/models/types';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import { toast } from '@package/ui';

import { ApartInfo } from '../ui/ApartInfo';
import { CombinedChart } from './CombinedChart';
import TransactionHistory from './TransactionHistory';

interface Props {
  data: ApartDetailResponse;
  apartName: string;
  regionCode: string;
}

export function ApartDetail({ data, apartName, regionCode }: Props) {
  const hasError = !data.tradeItems.length;
  const router = useRouter();
  const { favoriteApartList, addFavoriteApart, removeFavoriteApart } =
    useFavoriteApartList();

  const apartItem: ApartItem = useMemo(
    () => ({
      apartName,
      address: data.address,
    }),
    [apartName, data.address]
  );

  // 현재 아파트가 즐겨찾기에 있는지 확인
  const isFavorite = useMemo(
    () =>
      favoriteApartList.some(
        region =>
          region.regionCode === regionCode &&
          region.apartItems.some(
            item =>
              item.apartName === apartName && item.address === data.address
          )
      ),
    [favoriteApartList, regionCode, apartName, data.address]
  );

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        await removeFavoriteApart(regionCode, apartItem);
      } else {
        await addFavoriteApart(regionCode, apartItem);
      }
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error);
    }
  };

  useEffect(() => {
    if (hasError) {
      toast.error(`아파트 상세 정보를 불러오는데 실패했습니다. (${apartName})`);
      router.back();
    }
  }, []);

  if (hasError) {
    return null;
  }

  return (
    <div className="space-y-5">
      <ApartInfo
        apartName={apartName}
        address={data.address}
        housholdsCount={data.housholdsCount}
        parking={data.parking}
        floorAreaRatio={data.floorAreaRatio}
        buildingCoverageRatio={data.buildingCoverageRatio}
        isFavorite={isFavorite}
        onToggleFavorite={handleToggleFavorite}
      />
      <CombinedChart items={data.tradeItems} />
      <TransactionHistory items={data.tradeItems} />
    </div>
  );
}
