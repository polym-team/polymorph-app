import { Card, Typography } from '@package/ui';

export function ApartDetailSkeleton() {
  return (
    <div className="space-y-5">
      <Typography variant="h2" className="text-2xl font-bold">
        <div className="h-8 w-64 animate-pulse rounded-md bg-slate-200" />
      </Typography>

      {/* 아파트 정보 스켈레톤 */}
      <Card className="p-5">
        <Typography variant="large" className="mb-5 font-semibold">
          아파트 정보
        </Typography>
        <div className="space-y-4">
          <div className="flex items-center gap-x-2">
            <div className="h-7 w-32 animate-pulse rounded-md bg-slate-200" />
            <div className="h-7 w-24 animate-pulse rounded-md bg-slate-200" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-5 w-20 animate-pulse rounded bg-slate-200" />
                <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 실거래가 차트 스켈레톤 */}
      <Card className="p-5">
        <Typography variant="large" className="mb-5 font-semibold">
          실거래가 차트
        </Typography>
        <div className="relative w-full overflow-x-auto">
          <div
            className="relative mx-auto"
            style={{
              height: '400px',
              minWidth: '1024px',
              maxWidth: '100%',
              width: '100%',
            }}
          >
            <div className="h-full w-full animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      </Card>

      {/* 거래 내역 스켈레톤 */}
      <Card className="p-5">
        <Typography variant="large" className="mb-5 font-semibold">
          거래 내역
        </Typography>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 w-full animate-pulse rounded bg-slate-200"
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
