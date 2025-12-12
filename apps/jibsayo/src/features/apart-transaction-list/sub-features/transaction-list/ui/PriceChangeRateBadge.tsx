import { ApartTransactionItem } from '@/entities/apart-transaction';
import { calculateAreaPyeong } from '@/entities/transaction';
import {
  formatDealDate,
  formatFloorText,
  formatKoreanAmountText,
  formatPercentText,
  formatPyeongText,
} from '@/shared/utils/formatter';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@package/utils';

interface PriceChangeRateBadgeProps {
  priceChangeRate: number;
  prevTransactionItem?: ApartTransactionItem['prevTransaction'];
}

export function PriceChangeRateBadge({
  priceChangeRate,
  prevTransactionItem,
}: PriceChangeRateBadgeProps) {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (prevTransactionItem && containerRef.current) {
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

  const tooltipContent = shouldRender && prevTransactionItem && (
    <div className="fixed inset-0 z-50" onClick={handleTooltipClose}>
      <div
        className={cn(
          'absolute rounded border bg-white p-4 shadow transition-all duration-200 ease-in-out',
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
          <h3 className="text-sm text-gray-500 lg:text-base">직전 실거래가</h3>
        </div>

        <div className="space-y-1 text-sm lg:text-base">
          <div className="flex justify-between">
            <span className="text-gray-900">거래일</span>
            <span className="text-primary">
              {formatDealDate(prevTransactionItem.dealDate)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-900">층/평수</span>
            <span className="text-primary">
              {formatFloorText(prevTransactionItem.floor)} /{' '}
              {formatPyeongText(calculateAreaPyeong(prevTransactionItem.size))}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-900">거래가격:</span>
            <span className="text-primary">
              {formatKoreanAmountText(prevTransactionItem.dealAmount)}
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
          'whitespace-nowrap rounded-[6px] px-2 py-1 text-xs transition-colors lg:text-sm',
          prevTransactionItem ? 'cursor-pointer' : '',
          priceChangeRate > 0
            ? 'bg-red-100 text-red-700'
            : 'bg-blue-100 text-blue-700'
        )}
        onClick={handleClick}
      >
        {priceChangeRate > 0 ? '↗' : '↘'} {formatPercentText(priceChangeRate)}
      </span>

      {tooltipContent && createPortal(tooltipContent, document.body)}
    </div>
  );
}
