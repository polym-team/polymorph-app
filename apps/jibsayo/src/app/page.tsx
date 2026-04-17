import { Landing } from '@/features/landing';
import { PageLayout } from '@/widgets/ui/page-layout/PageLayout';

import { Suspense } from 'react';

import { LandingContent } from './LandingContent';

export default function HomePage() {
  return (
    <PageLayout bgColor="gray">
      <Landing>
        <Suspense
          fallback={
            <div className="flex flex-col gap-y-4">
              <div className="rounded-xl bg-white p-4">
                <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-y-1 rounded-lg bg-gray-50 p-4"
                    >
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                      <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
                      <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          }
        >
          <LandingContent />
        </Suspense>
      </Landing>
    </PageLayout>
  );
}
