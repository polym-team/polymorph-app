import { ApartDetailTradeHistoryItem } from '@/app/api/apart/types';
import { calculateAreaPyeong } from '@/shared/services/transactionService';
import {
  formatDate,
  formatFloor,
  formatKoreanAmountSimpleText,
  formatPercent,
  formatPyeong,
} from '@/shared/utils/formatters';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@package/utils';

interface PriceChangeRateBadgeProps {
  priceChangeRate: number;
  previousTradeItem?: ApartDetailTradeHistoryItem;
}

export function PriceChangeRateBadge({
  priceChangeRate,
  previousTradeItem,
}: PriceChangeRateBadgeProps) {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (previousTradeItem && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 8, // 뱃지 위쪽에 8px 간격
      });
      setShouldRender(true);
      // 다음 프레임에서 애니메이션 시작
      requestAnimationFrame(() => {
        setIsTooltipVisible(true);
      });
    }
  };

  const handleTooltipClose = () => {
    setIsTooltipVisible(false);
    // 애니메이션 완료 후 DOM에서 제거
    setTimeout(() => {
      setShouldRender(false);
    }, 200);
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        if (isTooltipVisible) {
          handleTooltipClose();
        }
      }
    };

    if (isTooltipVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTooltipVisible]);

  const tooltipContent = shouldRender && previousTradeItem && (
    <div className="fixed inset-0 z-50" onClick={handleTooltipClose}>
      <div
        className={cn(
          'absolute rounded-lg border bg-white p-3 shadow-lg transition-all duration-200 ease-in-out',
          isTooltipVisible
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-1 scale-95 opacity-0'
        )}
        onClick={e => e.stopPropagation()}
        style={{
          left: `${tooltipPosition.x}px`,
          top: `${tooltipPosition.y}px`,
          transform: 'translateX(-50%)',
          minWidth: '200px',
        }}
      >
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-gray-900">직전 실거래가</h3>
        </div>

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">거래일</span>
            <span className="font-medium">
              {formatDate(previousTradeItem.tradeDate)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">층/평수</span>
            <span className="font-medium">
              {formatFloor(previousTradeItem.floor)} /{' '}
              {formatPyeong(calculateAreaPyeong(previousTradeItem.size))}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">거래가격:</span>
            <span className="font-medium">
              {formatKoreanAmountSimpleText(previousTradeItem.tradeAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative" ref={containerRef}>
      <span
        className={cn(
          'rounded-full px-1.5 py-0.5 text-xs transition-colors',
          previousTradeItem ? 'cursor-pointer' : '',
          priceChangeRate > 0
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        )}
        onClick={handleClick}
      >
        {priceChangeRate > 0 ? '↗' : '↘'} {formatPercent(priceChangeRate)}
      </span>

      {tooltipContent && createPortal(tooltipContent, document.body)}
    </div>
  );
}
