import { ApartDetailResponse } from '@/app/api/apart/types';
import { ApartDetailInfo } from '@/features/apart-detail-info';
import { ApartTransactionHistory } from '@/features/apart-transaction-history';

import { ApartDetailPageLayout } from './ApartDetailPageLayout';

interface ApartDetailPageWidgetProps {
  data: ApartDetailResponse;
}

export function ApartDetailPageWidget({ data }: ApartDetailPageWidgetProps) {
  return (
    <ApartDetailPageLayout>
      <ApartDetailInfo data={data} />
      <ApartTransactionHistory data={data} />
    </ApartDetailPageLayout>
  );
}
