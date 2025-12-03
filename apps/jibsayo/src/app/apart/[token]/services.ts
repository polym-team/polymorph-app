import { getApartByApartToken } from '@/app/api/apartments/[token]/service';
import { ApartByIdResponse } from '@/app/api/apartments/[token]/types';
import { parseApartToken } from '@/app/api/shared/services/transaction/service';

export async function fetchApartInfo(
  token: string
): Promise<ApartByIdResponse | null> {
  try {
    const parsedToken = parseApartToken(token);
    if (!parsedToken) {
      return null;
    }

    const data = await getApartByApartToken(token);

    return data;
  } catch {
    return null;
  }
}
