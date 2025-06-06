import { ApartDetailResponse } from '@/app/api/apart/types';

import { ApartInfo } from '../ui/ApartInfo';
import { TransactionChart } from './TransactionChart';
import TransactionHistory from './TransactionHistory';

interface Props {
  data: ApartDetailResponse;
}

export function ApartDetail({ data }: Props) {
  return (
    <div className="space-y-5">
      <ApartInfo
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
