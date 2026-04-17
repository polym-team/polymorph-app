export function Loading() {
  return (
    <div className="flex w-full flex-col gap-y-5">
      {/* 아파트 정보 스켈레톤 */}
      <div className="flex flex-col gap-y-4 bg-white px-3 py-4 md:px-0">
        <div className="flex flex-col gap-y-1">
          <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-y-1 rounded-lg bg-gray-50 p-3">
              <div className="h-3 w-12 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
        {/* 지도 스켈레톤 */}
        <div className="-mx-3 md:mx-0 md:rounded">
          <div className="aspect-[4/3] max-h-[450px] w-full animate-pulse bg-gray-200" />
        </div>
      </div>
      {/* 거래 내역 스켈레톤 */}
      <div className="flex flex-col gap-y-3 bg-white px-3 py-4 md:px-0">
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
        <div className="flex gap-x-2">
          <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
        </div>
        {/* 차트 스켈레톤 */}
        <div className="h-[300px] w-full animate-pulse rounded bg-gray-100" />
        {/* 거래 리스트 스켈레톤 */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b border-gray-50 py-3"
          >
            <div className="flex flex-col gap-y-1">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
            </div>
            <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
