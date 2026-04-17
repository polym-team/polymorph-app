import { PageContainer } from '@/shared/ui/PageContainer';

import { MyFavorites } from './sub-features/my-favorites/MyFavorites';
import { RecentTransactions } from './sub-features/recent-transactions/RecentTransactions';
import { RegionSummary } from './sub-features/region-summary/RegionSummary';
import { SearchBar } from './sub-features/search-bar/SearchBar';
import type { RecentTransaction, RegionPriceSummary } from './types';

interface LandingProps {
  recentTransactions: RecentTransaction[];
  regionSummaries: RegionPriceSummary[];
}

export function Landing({ recentTransactions, regionSummaries }: LandingProps) {
  return (
    <div className="flex flex-col gap-y-4">
      <PageContainer>
        <div className="mb-4">
          <h1 className="text-lg font-bold">어떤 아파트를 찾고 계세요?</h1>
          <p className="mt-0.5 text-sm text-gray-400">
            관심 있는 아파트의 실거래가를 확인해보세요
          </p>
        </div>
        <SearchBar />
      </PageContainer>

      <MyFavorites />

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
    </div>
  );
}
