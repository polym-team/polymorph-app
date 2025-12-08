import { HorizontalScrollContainer } from '@/shared/ui/HorizontalScrollContainer';
import { PageContainer } from '@/shared/ui/PageContainer';

import { Card } from '@package/ui';

export function TransactionListSkeleton() {
  return (
    <PageContainer bgColor="white" className="pb-12 pt-4 lg:pt-6">
      <div className="h-6 w-24 animate-pulse rounded bg-gray-200 lg:h-7" />
      <div className="mt-2 flex flex-col gap-y-5">
        <Card className="flex flex-col">
          <div className="flex flex-col gap-y-2 p-2 lg:p-4">
            <HorizontalScrollContainer className="gap-x-1">
              {[1, 2, 3, 4].map(item => (
                <div
                  key={item}
                  className="h-8 w-16 animate-pulse rounded bg-gray-200 lg:h-9 lg:w-20"
                />
              ))}
            </HorizontalScrollContainer>
          </div>
          <hr className="border-gray-100" />
          <div className="flex flex-col gap-y-2 p-2 lg:p-4">
            <HorizontalScrollContainer className="gap-x-1">
              {[1, 2, 3, 4, 5, 6].map(item => (
                <div
                  key={item}
                  className="h-[34px] w-20 animate-pulse rounded-full bg-gray-200 lg:h-[34px]"
                />
              ))}
            </HorizontalScrollContainer>
          </div>
        </Card>

        <div className="h-[300px] animate-pulse rounded bg-gray-200 lg:h-[400px]" />

        <div className="space-y-2">
          <div className="rounded border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="flex gap-x-4">
                <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
                <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                <div className="ml-auto h-5 w-24 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
            {[1, 2, 3, 4, 5].map(item => (
              <div
                key={item}
                className="border-b border-gray-200 px-4 py-4 last:border-b-0"
              >
                <div className="flex items-center gap-x-4">
                  <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
                  <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                  <div className="ml-auto h-6 w-28 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-x-2 py-4">
            {[1, 2, 3, 4, 5].map(item => (
              <div
                key={item}
                className="h-10 w-10 animate-pulse rounded bg-gray-200"
              />
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
