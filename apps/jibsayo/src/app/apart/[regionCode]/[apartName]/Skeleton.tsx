export function Skeleton() {
  return (
    <div className="space-y-5">
      {/* ApartInfo 스켈레톤 */}
      <div className="rounded-lg border bg-white p-3 shadow-sm">
        <div className="mb-5 flex items-center gap-1">
          <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
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

      {/* CombinedChart 스켈레톤 */}
      <div className="rounded-lg border bg-white p-3 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(index => (
              <div
                key={index}
                className="h-8 w-16 animate-pulse rounded bg-gray-200"
              />
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="h-[350px] w-full animate-pulse rounded bg-gray-100" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </div>

      {/* TransactionHistory 스켈레톤 */}
      <div className="rounded-lg border bg-white p-3 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="space-y-3">
          {/* 테이블 헤더 */}
          <div className="flex border-b pb-2">
            {[1, 2, 3, 4, 5].map(index => (
              <div
                key={index}
                className="flex-1 animate-pulse rounded bg-gray-200"
                style={{ height: '20px' }}
              />
            ))}
          </div>

          {/* 테이블 행들 */}
          {[1, 2, 3, 4, 5].map(rowIndex => (
            <div key={rowIndex} className="flex border-b py-3 last:border-b-0">
              {[1, 2, 3, 4, 5].map(colIndex => (
                <div
                  key={colIndex}
                  className="flex-1 animate-pulse rounded bg-gray-100"
                  style={{ height: '16px' }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
