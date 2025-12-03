import { PageContainer } from '@/shared/ui/PageContainer';

export function TransactionListSkeleton() {
  return (
    <PageContainer bgColor="white" className="pb-10 pt-6">
      <div className="h-6 w-24 animate-pulse rounded bg-gray-200 lg:h-7" />
      <div className="mt-2 flex flex-col gap-y-5">
        <div className="flex flex-col gap-y-3 lg:rounded lg:bg-gray-100 lg:p-3">
          <div className="flex gap-x-1 rounded bg-gray-100 p-1.5 lg:justify-start lg:bg-transparent lg:p-0">
            {[1, 2, 3].map(item => (
              <div
                key={item}
                className="h-10 w-full animate-pulse rounded bg-gray-200 lg:h-12 lg:w-24"
              />
            ))}
          </div>
          <hr className="hidden lg:block" />
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(item => (
              <div
                key={item}
                className="h-[34px] w-20 animate-pulse rounded-full bg-gray-200 lg:h-[34px]"
              />
            ))}
          </div>
        </div>

        <div className="h-[300px] animate-pulse rounded bg-gray-200" />

        <div className="space-y-2">
          <div className="rounded border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="flex gap-x-4">
                <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
                <div className="ml-auto h-5 w-20 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
            {[1, 2, 3, 4, 5].map(item => (
              <div key={item} className="border-gray-200 px-4 py-4">
                <div className="flex items-center gap-x-4">
                  <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                  <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="ml-auto h-6 w-24 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-x-2 py-2">
            {[1, 2, 3].map(item => (
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
