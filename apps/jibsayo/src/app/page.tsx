import {
  fetchRecentTransactions,
  fetchRegionPriceSummaries,
} from '@/app/api/landing/services/db';
import { Landing } from '@/features/landing';
import { PageLayout } from '@/widgets/ui/page-layout/PageLayout';

export const revalidate = 300; // 5분마다 재생성

export default async function HomePage() {
  const [recentTransactions, regionSummaries] = await Promise.all([
    fetchRecentTransactions(),
    fetchRegionPriceSummaries(),
  ]);

  return (
    <PageLayout bgColor="gray">
      <Landing
        recentTransactions={recentTransactions}
        regionSummaries={regionSummaries}
      />
    </PageLayout>
  );
}
