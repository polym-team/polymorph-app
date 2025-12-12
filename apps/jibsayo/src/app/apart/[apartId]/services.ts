import { getApartByApartId } from '@/app/api/apartments/by-id/[apartId]/service';
import { ApartByIdResponse } from '@/app/api/apartments/by-id/[apartId]/types';

export const calculateApartId = (apartidParam: string): number | null => {
  const numericApartId = Number(apartidParam);

  return isNaN(numericApartId) ? null : numericApartId;
};

export async function fetchApartInfo(
  apartId: number
): Promise<ApartByIdResponse | null> {
  try {
    return await getApartByApartId(apartId);
  } catch {
    return null;
  }
}
