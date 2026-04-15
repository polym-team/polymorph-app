'use client';

import { PageContainer } from '@/shared/ui/PageContainer';

import { useLandingData } from './hooks';
import { MyFavorites } from './sub-features/my-favorites/MyFavorites';
import { RecentTransactions } from './sub-features/recent-transactions/RecentTransactions';
import { RegionSummary } from './sub-features/region-summary/RegionSummary';
import { SearchBar } from './sub-features/search-bar/SearchBar';

export function Landing() {
  const { data, isLoading } = useLandingData();

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

      {isLoading ? (
        <PageContainer>
          <div className="py-8 text-center text-sm text-gray-400">
            데이터를 불러오는 중...
          </div>
        </PageContainer>
      ) : (
        data && (
          <>
            {data.regionSummaries.length > 0 && (
              <PageContainer>
                <RegionSummary summaries={data.regionSummaries} />
              </PageContainer>
            )}

            {data.recentTransactions.length > 0 && (
              <PageContainer>
                <RecentTransactions transactions={data.recentTransactions} />
              </PageContainer>
            )}
          </>
        )
      )}
    </div>
  );
}
