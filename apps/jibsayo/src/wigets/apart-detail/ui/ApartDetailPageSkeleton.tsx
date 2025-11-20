import { ApartDetailInfoSkeleton } from '@/features/apart-detail-info';
import { ApartTransactionHistorySkeleton } from '@/features/apart-transaction-history/ui/ApartTransactionHistorySkeleton';

import { ApartDetailPageLayout } from './ApartDetailPageLayout';

export function ApartDetailPageSkeleton() {
  return (
    <ApartDetailPageLayout>
      <ApartDetailInfoSkeleton />
      <ApartTransactionHistorySkeleton />
    </ApartDetailPageLayout>
  );
}
