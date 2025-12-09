import { parseApartToken } from '@/app/api/shared/services/transaction/service';
import { ApartInfo, ApartInfoType } from '@/features/apart-info';
import { ApartTransactionList } from '@/features/apart-transaction-list';

import { Error } from './Error';
import { Layout } from './Layout';
import { fetchApartInfo } from './services';

interface ContentProps {
  apartToken: string;
}

export async function Content({ apartToken }: ContentProps) {
  const response = await fetchApartInfo(apartToken);
  const parsedToken = parseApartToken(apartToken);

  if (!parsedToken) {
    return <Error />;
  }

  const data: ApartInfoType = response ?? {
    regionCode: parsedToken.regionCode,
    apartName: parsedToken.apartName,
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
      <ApartInfo apartToken={apartToken} data={data} />
      <ApartTransactionList apartToken={apartToken} data={data} />
    </Layout>
  );
}
