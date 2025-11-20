import { BoxContainer } from '@/shared/ui/BoxContainer';

export function ApartTransactionHistorySkeleton() {
  return (
    <BoxContainer bgColor="white">
      {/* 제목 */}
      <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />

      <div className="mt-2 flex flex-col gap-y-5">
        {/* 필터 섹션 */}
        <div className="flex flex-col gap-3">
          {/* 기간 필터 */}
          <div className="flex items-center gap-2">
            <div className="h-9 w-20 animate-pulse rounded-md bg-gray-200" />
            <div className="h-9 w-20 animate-pulse rounded-md bg-gray-200" />
            <div className="h-9 w-20 animate-pulse rounded-md bg-gray-200" />
          </div>

          {/* 평수 필터 */}
          <div className="flex items-center gap-2">
            <div className="h-9 w-16 animate-pulse rounded-md bg-gray-200" />
            <div className="h-9 w-16 animate-pulse rounded-md bg-gray-200" />
            <div className="h-9 w-16 animate-pulse rounded-md bg-gray-200" />
          </div>
        </div>

        {/* 차트 섹션 */}
        <div className="relative w-full">
          <div className="h-64 w-full animate-pulse rounded-lg bg-gray-200" />
          {/* 차트 내부 그리드 라인 효과 */}
          <div className="absolute inset-0 flex flex-col justify-between p-4">
            <div className="h-px w-full bg-gray-300/50" />
            <div className="h-px w-full bg-gray-300/50" />
            <div className="h-px w-full bg-gray-300/50" />
            <div className="h-px w-full bg-gray-300/50" />
          </div>
        </div>

        {/* 테이블 섹션 */}
        <div className="space-y-3">
          {/* 테이블 헤더 */}
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-8">
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          </div>

          {/* 테이블 행들 */}
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-8">
                {/* 거래일 */}
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                {/* 층/평수 */}
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
              </div>
              {/* 거래가격 */}
              <div className="flex items-center gap-2">
                <div className="h-5 w-12 animate-pulse rounded-full bg-gray-200" />
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </BoxContainer>
  );
}
