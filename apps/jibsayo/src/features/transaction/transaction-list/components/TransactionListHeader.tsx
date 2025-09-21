import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import { useSearchParams } from '@/entities/transaction';

import { RegionNameTitle } from '../ui/RegionNameTitle';
import { TransactionFilter } from '../ui/TransactionFilter';

export function TransactionListHeader() {
  const { searchParams } = useSearchParams();
  const cityName = getCityNameWithRegionCode(searchParams.regionCode);
  const regionName = getRegionNameWithRegionCode(searchParams.regionCode);
  const isShowRegionName = cityName && regionName;

  return (
    <div className="flex flex-col gap-y-2">
      {isShowRegionName && (
        <RegionNameTitle cityName={cityName} regionName={regionName} />
      )}
      <TransactionFilter title="필터" value="적용된 필터 없음">
        <div>
          <div>
            <p>평수</p>
          </div>
        </div>
      </TransactionFilter>
    </div>
  );
}
