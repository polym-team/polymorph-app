import { ApartDetailResponse } from '@/app/api/apart/types';
import { ApartDetail } from '@/features/apart-detail';

import { notFound } from 'next/navigation';

interface Props {
  searchParams: {
    apartName?: string;
    regionCode?: string;
  };
}

export default async function ApartPage({ searchParams }: Props) {
  const { apartName } = searchParams;

  // 아파트명이 없으면 404 처리
  if (!apartName) {
    notFound();
  }

  let data: ApartDetailResponse | null = null;

  try {
    const response = await fetch(
      `${process.env.BASE_URL}/api/apart?apartName=${encodeURIComponent(apartName)}`
    );

    if (response.ok) {
      data = await response.json();
    }
  } catch (error) {
    console.error('아파트 데이터 조회 실패:', error);
  }

  if (!data) {
    notFound();
  }

  return <ApartDetail data={data} />;
}
