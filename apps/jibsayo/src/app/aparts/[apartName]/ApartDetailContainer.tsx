import { ApartDetail } from '@/features/apart-detail/components/ApartDetail';

import { getApartDetail } from './service';

interface Props {
  apartName: string;
}

export async function ApartDetailContainer({ apartName }: Props) {
  const data = await getApartDetail(apartName);

  if (!data) {
    return null;
  }

  return <ApartDetail data={data} apartName={apartName} />;
}
