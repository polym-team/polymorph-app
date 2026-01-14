export function Skeleton() {
  return (
    <div className="-mx-3 flex w-full flex-col gap-y-3 lg:mx-0">
      <div className="flex flex-col lg:rounded lg:border lg:border-gray-100">
        {[1, 2, 5].map(itemIndex => (
          <div
            key={itemIndex}
            className="flex flex-col items-start gap-2 border-b border-gray-100 bg-white px-3 py-3.5 last:border-b-0 md:flex-row md:items-center md:justify-between md:px-5 md:py-3.5 md:first:rounded-t md:last:rounded-b"
          >
            <div className="flex items-center gap-x-1">
              <div className="h-5 w-28 animate-pulse rounded bg-gray-100" />
              <div className="h-7 w-7 animate-pulse rounded-full bg-gray-100" />
            </div>

            <div className="h-6 w-full animate-pulse rounded-sm bg-gray-100 md:w-[250px]" />
          </div>
        ))}
      </div>
    </div>
  );
}
