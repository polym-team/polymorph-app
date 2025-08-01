import { Card } from '@package/ui';

export function FavoriteApartListSkeleton() {
  return (
    <div className="flex flex-col gap-y-5">
      {[1, 2, 3].map(regionIndex => (
        <div key={regionIndex}>
          <Card className="flex flex-col">
            {/* 지역명 스켈레톤 */}
            <div className="p-3 md:p-5">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
            </div>
            <hr className="my-0 border-gray-200" />

            {/* 아파트 버튼들 스켈레톤 */}
            <div className="flex flex-wrap gap-2 p-3 md:p-4">
              {[1, 2, 3, 4].map(apartIndex => (
                <div
                  key={apartIndex}
                  className="border-input bg-background flex flex-shrink-0 rounded-md border"
                >
                  <div className="whitespace-nowrap rounded-r-none border-0 px-3 py-1.5 text-sm">
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                  </div>
                  <div className="h-full min-w-0 rounded-l-none border-0 px-2 py-1.5">
                    <div className="h-3 w-3 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}
