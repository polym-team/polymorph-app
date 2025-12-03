import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import { HorizontalScrollContainer } from '@/shared/ui/HorizontalScrollContainer';
import { formatNumber } from '@/shared/utils/formatter';

import { Button } from '@package/ui';

import { ApartInfoType } from '../type';
import { DetailItem } from './DetailItem';

interface DetailInfoProps {
  data: ApartInfoType;
}

export function DetailInfo({ data }: DetailInfoProps) {
  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex flex-col gap-y-3">
        <div className="flex flex-col lg:gap-y-1">
          <span className="text-xl font-semibold">{data.apartName}</span>
          <span className="text-gray-400">
            {getCityNameWithRegionCode(data.regionCode)}{' '}
            {getRegionNameWithRegionCode(data.regionCode)} {data.dong}
          </span>
        </div>
        <div className="flex flex-col gap-y-2">
          <div className="grid grid-cols-2 gap-3 rounded bg-gray-50 p-3">
            {data.buildYear && (
              <DetailItem title="연식" content={`${data.buildYear}년식`} />
            )}
            {data.householdCount && (
              <DetailItem
                highlight
                title="세대수"
                content={`${formatNumber(data.householdCount)}세대`}
                subContent={
                  data.rentHouseholdCount
                    ? `임대 ${formatNumber(data.rentHouseholdCount)}세대`
                    : undefined
                }
              />
            )}
            {data.maxFloor && (
              <DetailItem title="최고 층수" content={`${data.maxFloor}층`} />
            )}
            {data.parkingCount && (
              <DetailItem
                title="주차대수"
                content={`${formatNumber(data.parkingCount)}대`}
                subContent={
                  data.groundParkingCount && data.undergroundParkingCount
                    ? `지상 ${formatNumber(
                        data.groundParkingCount
                      )}대 · 지하 ${formatNumber(data.undergroundParkingCount)}대`
                    : undefined
                }
              />
            )}
          </div>
        </div>
      </div>
      {data.amenities && data.amenities.length > 0 && (
        <div className="flex flex-col gap-y-2">
          <span className="text-sm text-gray-500">편의 시설</span>
          <HorizontalScrollContainer>
            <div className="flex gap-x-1">
              {data.amenities.map(item => (
                <Button key={item} size="sm" rounded>
                  {item}
                </Button>
              ))}
            </div>
          </HorizontalScrollContainer>
        </div>
      )}
    </div>
  );
}
