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
      const jsonData = await response.json();
      return {
        regionCode,
        apartName,
        ...jsonData,
      };
    }

    return null;
  } catch (error) {
    console.error('아파트 데이터 조회 실패:', error);
    return null;
  }
}
