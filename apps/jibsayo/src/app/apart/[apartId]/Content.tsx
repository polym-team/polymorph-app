import { ApartInfo, ApartInfoType } from '@/features/apart-info';
import { ApartTransactionList } from '@/features/apart-transaction-list';

import { Error } from './Error';
import { Layout } from './Layout';
import {
  calculateApartId,
  calculateFallbackToken,
  fetchApartInfo,
} from './services';

interface ContentProps {
  apartId: string;
}

export async function Content({ apartId: apartIdParam }: ContentProps) {
  const apartId = calculateApartId(apartIdParam);
  const fallbackToken = calculateFallbackToken(apartIdParam);
  const response = apartId ? await fetchApartInfo(apartId) : null;

  console.log('apartId: ', apartId);
  console.log('fallbackToken: ', fallbackToken);

  if (!response && !fallbackToken) {
    return <Error />;
  }

  const data: ApartInfoType = response ?? {
    regionCode: fallbackToken!.regionCode,
    apartName: fallbackToken!.apartName,
    buildYear: null,
    dong: null,
    apartType: null,
    saleType: null,
    heatingType: null,
    buildedType: null,
    buildingCount: null,
    constructorCompany: null,
    developerCompany: null,
    householdCount: null,
    saleHouseholdCount: null,
    rentHouseholdCount: null,
    parkingCount: null,
    groundParkingCount: null,
    undergroundParkingCount: null,
    electronicParkingCount: null,
    maxFloor: null,
    amenities: null,
  };

  return (
    <Layout>
      <ApartInfo apartId={apartId} data={data} />
      <ApartTransactionList apartId={apartId} />
    </Layout>
  );
}
