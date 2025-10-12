export function ApartInfoTableSkeleton() {
  return (
    <div className="space-y-5">
      <div className="rounded-lg border bg-white p-3 shadow-sm">
        <div className="mb-2 flex items-center gap-1 px-1">
          <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-6 animate-pulse rounded bg-gray-200" />
        </div>

        {[1, 2, 3, 4].map(index => (
          <div key={index} className="flex items-start border-t px-1 last:pb-0">
            <div className="w-[110px] py-3.5">
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="flex-1 py-3">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        ))}

        {/* 지도 스켈레톤 */}
        <div className="mt-4 h-64 w-full animate-pulse rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}
