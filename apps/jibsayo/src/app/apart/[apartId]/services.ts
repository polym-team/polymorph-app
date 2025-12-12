import { getApartByApartId } from '@/app/api/apartments/[apartId]/service';
import { ApartByIdResponse } from '@/app/api/apartments/[apartId]/types';
import { parseFallbackToken } from '@/app/api/shared/services/transaction/service';

export const calculateApartId = (apartidParam: string): number | null => {
  const numericApartId = Number(apartidParam);

  return isNaN(numericApartId) ? null : numericApartId;
};

export const calculateFallbackToken = (
  apartidParam: string
): ReturnType<typeof parseFallbackToken> | null => {
  const apartId = calculateApartId(apartidParam);
  if (apartId !== null) return null;

  const parsedToken = parseFallbackToken(apartidParam);
  if (!parsedToken) return null;

  return parsedToken;
};

export async function fetchApartInfo(
  apartId: number
): Promise<ApartByIdResponse | null> {
  try {
    const data = await getApartByApartId(apartId);

    return data;
  } catch {
    return null;
  }
}
