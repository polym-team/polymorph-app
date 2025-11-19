import { CardList } from '@/shared/ui/CardList';

export function TransactionCardListSkeleton() {
  return (
    <div className="flex flex-col gap-y-5">
      <CardList>
        {Array.from({ length: 5 }).map((_, index) => (
          <CardList.Item key={index}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col gap-y-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-4 animate-pulse rounded-full bg-gray-200"></div>
                </div>
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
              </div>
              <div className="flex flex-col items-end gap-y-1.5">
                <div className="h-5 w-16 animate-pulse rounded bg-gray-200"></div>
                <div className="h-3 w-12 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>
          </CardList.Item>
        ))}
      </CardList>
    </div>
  );
}
