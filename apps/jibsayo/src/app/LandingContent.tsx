import {
  fetchRecentTransactions,
  fetchRegionPriceSummaries,
} from '@/app/api/landing/services/db';
import { PageContainer } from '@/shared/ui/PageContainer';

import { RecentTransactions } from '@/features/landing/sub-features/recent-transactions/RecentTransactions';
import { RegionSummary } from '@/features/landing/sub-features/region-summary/RegionSummary';

export async function LandingContent() {
  const [recentTransactions, regionSummaries] = await Promise.all([
    fetchRecentTransactions(),
    fetchRegionPriceSummaries(),
  ]);

  return (
    <>
      {regionSummaries.length > 0 && (
        <PageContainer>
          <RegionSummary summaries={regionSummaries} />
        </PageContainer>
      )}

      {recentTransactions.length > 0 && (
        <PageContainer>
          <RecentTransactions transactions={recentTransactions} />
        </PageContainer>
      )}
    </>
  );
}
