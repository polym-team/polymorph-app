'use client';

import { ApartDetailResponse } from '@/app/api/apart/models/types';

import { ApartInfoTable } from '../ui/ApartInfoTable';

interface ApartDetailInfoProps {
  data: ApartDetailResponse;
}

export function ApartDetailInfo({ data }: ApartDetailInfoProps) {
  return <ApartInfoTable data={data} />;
}
