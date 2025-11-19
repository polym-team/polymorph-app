export function ApartInfoTableSkeleton() {
  return (
    <div className="flex flex-col gap-y-4 bg-white p-3">
      {/* 제목과 주소 */}
      <div className="flex flex-col gap-y-1">
        <div className="h-7 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-5 w-56 animate-pulse rounded bg-gray-200" />
      </div>

      {/* 정보 카드들 */}
      <div className="flex flex-col gap-y-2">
        {[1, 2, 3].map(index => (
          <div
            key={index}
            className="bg-primary/5 flex items-center justify-between gap-x-2 rounded p-3"
          >
            <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* 지도 스켈레톤 */}
      <div className="h-64 w-full animate-pulse rounded bg-gray-200" />
    </div>
  );
}
