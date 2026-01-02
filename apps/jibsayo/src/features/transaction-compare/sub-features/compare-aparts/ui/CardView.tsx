import { calculateAreaPyeong } from '@/entities/transaction';
import {
  formatDealDate,
  formatFloorText,
  formatKoreanAmountText,
  formatNumber,
  formatPyeongText,
  formatSizeText,
} from '@/shared/utils/formatter';

import { useRouter } from 'next/navigation';

import { Card } from '@package/ui';

import { CompareApartData } from '../types';

interface CardViewProps {
  items: CompareApartData[];
  loading?: boolean;
}

export function CardView({ items, loading = false }: CardViewProps) {
  const router = useRouter();

  const handleCardClick = (apartId: number) => {
    router.push(`/apart/${apartId}`);
  };

  return (
    <div className="flex flex-col gap-y-2">
      {items.map(item => (
        <Card
          key={item.id}
          className="cursor-pointer transition-colors hover:bg-gray-50"
          onClick={() => handleCardClick(item.id)}
        >
          <Card.Content className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-col gap-y-1">
                <span className="font-semibold">{item.apartName}</span>
                <span className="text-sm text-gray-600">{item.region}</span>
              </div>
              <div className="flex gap-x-1">
                {loading && !item.householdCount && !item.completionYear ? (
                  <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
                ) : (
                  <>
                    {item.householdCount && (
                      <span className="text-sm text-gray-600">
                        {formatNumber(item.householdCount)}세대 ·
                      </span>
                    )}
                    {item.completionYear && (
                      <span className="text-sm text-gray-600">
                        {item.completionYear}년식
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            {item.recentTransaction && (
              <div className="mt-3 rounded bg-gray-100 px-3 py-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-primary bg-primary/10 rounded-sm px-2 py-1 text-sm">
                      최근 거래
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col items-end">
                    <span className="text-primary font-semibold">
                      {formatKoreanAmountText(
                        item.recentTransaction.dealAmount
                      )}
                    </span>
                    <div className="flex flex-wrap items-center justify-end gap-x-1">
                      <span className="text-xs text-gray-500">
                        {formatDealDate(item.recentTransaction.dealDate)} ·
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatFloorText(item.recentTransaction.floor)} ·
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatPyeongText(
                          calculateAreaPyeong(item.recentTransaction.size)
                        )}{' '}
                        ({formatSizeText(item.recentTransaction.size)})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card.Content>
        </Card>
      ))}
    </div>
  );
}
