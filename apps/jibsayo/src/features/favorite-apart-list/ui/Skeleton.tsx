export function Skeleton() {
  return (
    <div className="-mx-3 flex w-full flex-col gap-y-3 lg:mx-0">
      <div className="flex flex-col lg:rounded lg:border lg:border-gray-100">
        {[1, 2, 3].map(itemIndex => (
          <div
            key={itemIndex}
            className="flex flex-col items-start gap-2 border-b border-gray-100 bg-white px-3 py-2.5 last:border-b-0 lg:flex-row lg:items-center lg:justify-between lg:px-5 lg:py-4 lg:first:rounded-t lg:last:rounded-b"
          >
            <div className="flex items-center gap-x-1">
              <div className="h-5 w-28 animate-pulse rounded bg-gray-100" />
              <div className="h-7 w-7 animate-pulse rounded-full bg-gray-100" />
            </div>

            <div className="flex items-center gap-x-2">
              <div className="h-6 w-16 animate-pulse rounded-sm bg-gray-100" />
              <div className="flex items-center gap-x-1">
                <div className="h-4 w-12 animate-pulse rounded bg-gray-100" />
                <span className="text-sm text-gray-300">·</span>
                <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
                <span className="text-sm text-gray-300">·</span>
                <div className="h-4 w-10 animate-pulse rounded bg-gray-100" />
                <span className="text-sm text-gray-300">·</span>
                <div className="h-4 w-8 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
