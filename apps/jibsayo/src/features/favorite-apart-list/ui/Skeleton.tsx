import { PageContainer } from '@/shared/ui/PageContainer';

export function Skeleton() {
  return (
    <PageContainer className="p-0">
      <div className="flex w-full flex-col gap-y-3 pb-10">
        {[1, 2, 3].map(index => (
          <div key={index}>
            {/* 지역명 헤더 스켈레톤 */}
            <div className="p-3">
              <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
            </div>
            {/* 아파트 아이템들 스켈레톤 */}
            <div className="flex flex-col">
              {[1, 2, 3, 4].map(itemIndex => (
                <div
                  key={itemIndex}
                  className="flex items-center justify-between border-b border-gray-100 bg-white p-3 last:border-b-0"
                >
                  <div className="flex items-center gap-x-1">
                    <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
                  </div>
                  <div className="h-7 w-7 animate-pulse rounded-full bg-gray-200" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
