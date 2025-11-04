import { ApartDetailResponse } from '@/app/api/apart/types';

export async function fetchApartDetail(
  regionCode: string,
  apartName: string
): Promise<ApartDetailResponse | null> {
  try {
    const response = await fetch(
      `${process.env.BASE_URL}/api/apart?apartName=${encodeURIComponent(
        apartName
      )}&area=${regionCode}`
    );

    if (response.ok) {
      return await response.json();
    }

    return null;
  } catch {
    return null;
  }
}
