import { getApartByApartId } from '@/app/api/apartments/[apartId]/service';
import { ApartByIdResponse } from '@/app/api/apartments/[apartId]/types';

export async function fetchApartInfo(
  apartId: string
): Promise<ApartByIdResponse | null> {
  try {
    const data = await getApartByApartId(apartId);

    return data;
  } catch {
    return null;
  }
}
