import { Card } from '@package/ui';

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className || ''}`}
    />
  );
}

export function FavoriteApartListSkeleton() {
  return (
    <div className="flex w-full flex-col gap-y-5">
      {[1, 2, 3].map(index => (
        <div key={index}>
          <Card className="flex flex-col">
            {/* 지역명 헤더 스켈레톤 */}
            <div className="p-3">
              <Skeleton className="h-6 w-40" />
            </div>
            <hr className="my-0 border-gray-200" />
            {/* 아파트 아이템들 스켈레톤 */}
            <div className="flex flex-wrap gap-2 p-3">
              {[1, 2, 3, 4].map(itemIndex => (
                <Skeleton key={itemIndex} className="h-8 w-24" />
              ))}
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}
