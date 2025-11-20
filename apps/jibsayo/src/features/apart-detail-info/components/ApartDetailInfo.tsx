'use client';

import { ApartDetailResponse } from '@/app/api/apart/models/types';
import { BoxContainer } from '@/shared/ui/BoxContainer';

import { ApartInfoTable } from '../ui/ApartInfoTable';

interface ApartDetailInfoProps {
  data: ApartDetailResponse;
}

export function ApartDetailInfo({ data }: ApartDetailInfoProps) {
  return (
    <BoxContainer bgColor="white">
      <ApartInfoTable data={data} />
    </BoxContainer>
  );
}
