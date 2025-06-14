'use client';

import { ApartDetailResponse } from '@/app/api/apart/types';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { toast } from '@package/ui';

import { ApartInfo } from '../ui/ApartInfo';
import { TransactionChart } from './TransactionChart';
import TransactionHistory from './TransactionHistory';

interface Props {
  data: ApartDetailResponse;
  apartName: string;
}

export function ApartDetail({ data, apartName }: Props) {
  const hasError = !data.tradeItems.length;
  const router = useRouter();

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
      />
      <TransactionChart items={data.tradeItems} />
      <TransactionHistory items={data.tradeItems} />
    </div>
  );
}
