'use client';

import { PageContainer } from '@/shared/ui/PageContainer';

import { useLandingData } from '../../hooks';
import { RecentTransactions } from '../recent-transactions/RecentTransactions';
import { RegionSummary } from '../region-summary/RegionSummary';

export function LandingData() {
  const { data, isLoading } = useLandingData();

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex flex-col gap-y-4">
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-y-1 rounded-lg bg-gray-100 p-4"
              >
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!data) return null;

  return (
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
  );
}
