import { formatNumber } from '@/shared/utils/formatter';

import { ApartInfoType } from '../type';
import { Container } from './Container';
import { DetailItem } from './DetailItem';

interface ApartDetailInfoProps {
  data: ApartInfoType;
}

export function ApartDetailInfo({ data }: ApartDetailInfoProps) {
  return (
    <Container title="단지 정보">
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
    </Container>
  );
}
