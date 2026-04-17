import { PageLayout } from '@/widgets/ui/page-layout/PageLayout';

export default function Loading() {
  return (
    <PageLayout bgColor="gray">
      <div className="flex flex-col gap-y-8">
        {/* 검색 영역 스켈레톤 */}
        <div className="flex flex-col gap-y-3">
          <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
          <div className="flex gap-x-2">
            <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
        {/* 거래 목록 스켈레톤 */}
        <div className="flex flex-col gap-y-3">
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-x-3 rounded-lg bg-white p-4"
            >
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
              <div className="flex flex-1 flex-col gap-y-1.5">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
              </div>
              <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
