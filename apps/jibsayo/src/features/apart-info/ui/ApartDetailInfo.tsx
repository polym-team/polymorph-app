import { PageContainer } from '@/shared/ui/PageContainer';
import { formatNumber } from '@/shared/utils/formatter';

import { ApartInfoType } from '../type';
import { DetailItem } from './DetailItem';

interface ApartDetailInfoProps {
  data?: ApartInfoType;
}

export function ApartDetailInfo({ data }: ApartDetailInfoProps) {
  if (!data) {
    return (
      <PageContainer
        bgColor="white"
        className="flex flex-col gap-y-3 py-4 lg:py-6"
      >
        <span className="h-5 w-20 animate-pulse rounded bg-gray-200 lg:h-6" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map(item => (
            <div
              key={item}
              className="flex flex-col items-start gap-y-1 rounded bg-gray-100 px-4 py-3"
            >
              <div className="h-5 w-16 animate-pulse rounded bg-gray-200 lg:h-5" />
              <div className="flex flex-col gap-y-1">
                <div className="h-5 w-24 animate-pulse rounded bg-gray-200 lg:h-6" />
                {item === 3 && (
                  <div className="h-4 w-28 animate-pulse rounded bg-gray-200 lg:h-4" />
                )}
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      bgColor="white"
      className="flex flex-col gap-y-3 py-4 lg:py-6"
    >
      <span className="text-sm text-gray-500 lg:text-base">단지 정보</span>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {data.buildYear && (
          <DetailItem title="연식" content={`${data.buildYear}년식`} />
        )}
        {data.maxFloor && (
          <DetailItem title="최고 층수" content={`${data.maxFloor}층`} />
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
        {data.parkingCount && (
          <DetailItem
            title="주차"
            content={`${formatNumber(data.parkingCount)}대`}
            subContent={
              data.groundParkingCount && data.undergroundParkingCount
                ? `지상 ${formatNumber(data.groundParkingCount)}대 · 지하 ${formatNumber(data.undergroundParkingCount)}대`
                : undefined
            }
          />
        )}
      </div>
    </PageContainer>
  );
}
