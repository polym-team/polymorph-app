'use client';

import { ApartDetailResponse } from '@/app/api/apart/types';

import { Typography } from '@package/ui';

import { ApartInfo } from '../ui/ApartInfo';
import { TransactionChart } from './TransactionChart';
import TransactionHistory from './TransactionHistory';

interface Props {
  data: ApartDetailResponse;
  apartName: string;
}

export function ApartDetail({ data, apartName }: Props) {
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
