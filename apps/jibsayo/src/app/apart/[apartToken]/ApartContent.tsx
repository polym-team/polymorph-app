import { ApartInfo } from '@/features/apart-info';
import { ApartTransactionList } from '@/features/apart-transaction-list';

import { ApartError } from './ApartError';
import { Layout } from './Layout';

// import { fetchApartInfo } from './services';

interface ApartContentProps {
  apartToken: string;
}

export async function ApartContent({ apartToken }: ApartContentProps) {
  // const data = await fetchApartInfo(apartToken);

  const data = {
    regionCode: '11110',
    apartName: '래미안 강남 포레스티지',
    buildYear: 2018,
    dong: '역삼동',
    doro: '테헤란로 123',
    apartType: '아파트',
    saleType: '분양',
    heatingType: '개별난방',
    buildedType: '철근콘크리트',
    buildingCount: 5,
    constructorCompany: '삼성물산',
    developerCompany: '삼성물산',
    householdCount: 842,
    saleHouseholdCount: 720,
    rentHouseholdCount: 122,
    parkingCount: 1050,
    groundParkingCount: 150,
    undergroundParkingCount: 850,
    electronicParkingCount: 50,
    maxFloor: 35,
    amenities: [
      '어린이놀이터',
      '피트니스센터',
      '독서실',
      '커뮤니티센터',
      '게스트하우스',
      '주민공동시설',
    ],
  };

  if (!data) {
    return <ApartError />;
  }

  return (
    <Layout>
      <ApartInfo data={data} />
      <ApartTransactionList apartToken={apartToken} data={data} />
    </Layout>
  );
}
