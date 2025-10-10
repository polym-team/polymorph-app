import { ApartDetailInfoSkeleton } from '@/features/apart-detail-info';
import { ApartTransactionHistorySkeleton } from '@/features/apart-transaction-history/ui/ApartTransactionHistorySkeleton';

import { ApartDetailPageLayout } from './ApartDetailPageLayout';
import { Loader } from './Loader';

export function ApartDetailPageSkeleton() {
  return (
    <ApartDetailPageLayout>
      <ApartDetailInfoSkeleton />
      <ApartTransactionHistorySkeleton />
      <Loader />
    </ApartDetailPageLayout>
  );
}
