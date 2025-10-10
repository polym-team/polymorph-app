export function ApartInfoTableSkeleton() {
  return (
    <div className="space-y-5">
      <div className="rounded-lg border bg-white p-3 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-6 animate-pulse rounded bg-gray-200" />
        </div>

        {[1, 2, 3, 4].map(index => (
          <div
            key={index}
            className="flex items-center border-t py-2 last:pb-0"
          >
            <div className="w-[110px] py-2">
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="flex-1">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
