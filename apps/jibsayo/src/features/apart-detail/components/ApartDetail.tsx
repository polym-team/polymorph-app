import { ApartDetailResponse } from '@/app/api/apart/types';

import { ApartInfo } from '../ui/ApartInfo';
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
      <TransactionHistory items={data.tradeItems} />
    </div>
  );
}
