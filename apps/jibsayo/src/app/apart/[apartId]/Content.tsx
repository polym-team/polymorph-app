import { parseFallbackToken } from '@/app/api/shared/services/transaction/service';
import { ApartInfo, ApartInfoType } from '@/features/apart-info';
import { ApartTransactionList } from '@/features/apart-transaction-list';

import { Error } from './Error';
import { Layout } from './Layout';
import { fetchApartInfo } from './services';

interface ContentProps {
  apartId: string;
  fallbackToken?: string;
}

export async function Content({ apartId, fallbackToken }: ContentProps) {
  const response = apartId === 'null' ? null : await fetchApartInfo(apartId);
  const parsedToken = fallbackToken ? parseFallbackToken(fallbackToken) : null;

  if (!response && !parsedToken) {
    return <Error />;
  }

  const data: ApartInfoType = response ?? {
    regionCode: parsedToken!.regionCode,
    apartName: parsedToken!.apartName,
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
      <ApartInfo apartToken={apartId} data={data} />
      <ApartTransactionList apartToken={apartId} data={data} />
    </Layout>
  );
}
