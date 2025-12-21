import { calculateAreaPyeong } from '@/entities/transaction';
import {
  formatDealDate,
  formatFloorText,
  formatKoreanAmountText,
  formatNumber,
  formatPyeongText,
  formatSizeText,
} from '@/shared/utils/formatter';

import { Card } from '@package/ui';

import { CompareApartData } from '../types';

interface CardViewProps {
  items: CompareApartData[];
}

export function CardView({ items }: CardViewProps) {
  return (
    <div className="flex flex-col gap-y-2">
      {items.map(item => (
        <Card key={item.id}>
          <Card.Content className="pb-3">
            <div className="flex flex-col gap-y-1">
              <span className="font-semibold">{item.apartName}</span>
              <span className="text-sm text-gray-600">{item.region}</span>
            </div>
          </Card.Content>
          <hr className="border-gray-100" />
          <Card.Content className="py-2">
            <div className="flex gap-x-2 text-sm text-gray-600">
              <span>
                {item.householdCount
                  ? `${formatNumber(item.householdCount)}세대`
                  : '-'}
              </span>
              <span>·</span>
              <span>{item.completionYear}년식</span>
            </div>
          </Card.Content>
          {item.recentTransaction && (
            <>
              <hr className="border-gray-100" />
              <Card.Content className="py-2">
                <div className="flex flex-col gap-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">최근 거래</span>
                    <span className="text-primary font-semibold">
                      {formatKoreanAmountText(
                        item.recentTransaction.dealAmount
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex gap-x-2">
                      <span>
                        {formatFloorText(item.recentTransaction.floor)}
                      </span>
                      <span>
                        {formatPyeongText(
                          calculateAreaPyeong(item.recentTransaction.size)
                        )}{' '}
                        ({formatSizeText(item.recentTransaction.size)})
                      </span>
                    </div>
                    <span>
                      {formatDealDate(item.recentTransaction.dealDate)}
                    </span>
                  </div>
                </div>
              </Card.Content>
            </>
          )}
        </Card>
      ))}
    </div>
  );
}
