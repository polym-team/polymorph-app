'use client';

import * as React from 'react';

import { cn } from '@package/utils';

interface WheelPickerOption {
  value: string;
  label: string;
}

interface WheelPickerProps {
  options: WheelPickerOption[];
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export const WheelPicker: React.FC<WheelPickerProps> = ({
  options,
  value,
  onChange,
  className,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(() => {
    const index = options.findIndex(option => option.value === value);
    return index >= 0 ? index : 0;
  });
  const [isScrolling, setIsScrolling] = React.useState(false);
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout>();

  const itemHeight = 40; // iOS 기본 높이
  const visibleItems = 5; // 높이를 줄이기 위해 5개로 감소
  const centerIndex = Math.floor(visibleItems / 2);

  React.useEffect(() => {
    const index = options.findIndex(option => option.value === value);
    if (index >= 0 && index !== selectedIndex) {
      setSelectedIndex(index);
    }
  }, [value, options, selectedIndex]);

  React.useEffect(() => {
    if (scrollRef.current) {
      const scrollTop = selectedIndex * itemHeight;
      scrollRef.current.scrollTo({
        top: scrollTop,
        behavior: 'smooth',
      });
    }
  }, [selectedIndex, itemHeight]);

  const handleScroll = React.useCallback(() => {
    if (!scrollRef.current || isScrolling) return;

    const scrollTop = scrollRef.current.scrollTop;
    const newIndex = Math.round(scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(newIndex, options.length - 1));

    if (clampedIndex !== selectedIndex) {
      setSelectedIndex(clampedIndex);
      onChange(options[clampedIndex].value);
    }
  }, [itemHeight, options, selectedIndex, onChange, isScrolling]);

  const snapToNearestItem = React.useCallback(() => {
    if (!scrollRef.current) return;

    const scrollTop = scrollRef.current.scrollTop;
    const targetIndex = Math.round(scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(targetIndex, options.length - 1));

    scrollRef.current.scrollTo({
      top: clampedIndex * itemHeight,
      behavior: 'smooth',
    });

    if (clampedIndex !== selectedIndex) {
      setSelectedIndex(clampedIndex);
      onChange(options[clampedIndex].value);
    }
  }, [itemHeight, options, selectedIndex, onChange]);

  const handleScrollStart = React.useCallback(() => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  }, []);

  const handleScrollEnd = React.useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
      snapToNearestItem();
    }, 100); // iOS처럼 빠른 반응
  }, [snapToNearestItem]);

  const handleItemClick = (index: number) => {
    if (index < 0 || index >= options.length) return;

    setSelectedIndex(index);
    onChange(options[index].value);

    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: index * itemHeight,
        behavior: 'smooth',
      });
    }
  };

  // 패딩 아이템을 위한 더미 옵션들
  const paddedOptions = [
    ...Array(centerIndex)
      .fill(null)
      .map((_, i) => ({
        value: `padding-top-${i}`,
        label: '',
        isPadding: true,
      })),
    ...options.map(option => ({ ...option, isPadding: false })),
    ...Array(centerIndex)
      .fill(null)
      .map((_, i) => ({
        value: `padding-bottom-${i}`,
        label: '',
        isPadding: true,
      })),
  ];

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full overflow-hidden bg-transparent',
        className
      )}
      style={{ height: visibleItems * itemHeight }}
    >
      {/* iOS 스타일 선택 영역 */}
      <div
        className="pointer-events-none absolute left-0 right-0 z-10 border-b border-t border-gray-200 bg-gray-100/80"
        style={{
          top: centerIndex * itemHeight,
          height: itemHeight,
        }}
      />

      {/* 스크롤 컨테이너 */}
      <div
        ref={scrollRef}
        className="[-ms-overflow-style]:none [scrollbar-width]:none h-full overflow-y-scroll [&::-webkit-scrollbar]:hidden"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'y mandatory',
        }}
        onScroll={handleScroll}
        onTouchStart={handleScrollStart}
        onTouchEnd={handleScrollEnd}
        onMouseDown={handleScrollStart}
        onMouseUp={handleScrollEnd}
      >
        {paddedOptions.map((option, index) => {
          const actualIndex = index - centerIndex;
          const isSelected = actualIndex === selectedIndex;
          const distanceFromCenter = Math.abs(actualIndex - selectedIndex);

          // 맨 위/맨 아래 옵션 판별
          const isTopOption = actualIndex === 0;
          const isBottomOption = actualIndex === options.length - 1;

          // iOS 스타일 크기 및 투명도 계산
          const scale = isSelected
            ? 1
            : Math.max(0.7, 1 - distanceFromCenter * 0.15);
          const opacity = option.isPadding
            ? 0
            : Math.max(0.2, 1 - distanceFromCenter * 0.3);
          const fontSize = isSelected
            ? 20
            : Math.max(14, 20 - distanceFromCenter * 3);

          return (
            <div
              key={option.value}
              className={cn(
                'flex cursor-pointer select-none items-center justify-center transition-all duration-150',
                option.isPadding ? 'pointer-events-none' : '',
                isSelected ? 'font-medium text-black' : 'text-gray-600',
                distanceFromCenter === 1 ? 'text-gray-500' : '',
                distanceFromCenter >= 2 ? 'text-gray-400' : '',
                // 맨 위/맨 아래 옵션 진하게
                (isTopOption || isBottomOption) && !isSelected
                  ? 'font-medium text-gray-700'
                  : ''
              )}
              style={{
                height: itemHeight,
                scrollSnapAlign: 'start',
                transform: `scale(${scale})`,
                opacity,
                fontSize: `${fontSize}px`,
                fontWeight: isSelected
                  ? 600
                  : isTopOption || isBottomOption
                    ? 500
                    : 400,
              }}
              onClick={() => !option.isPadding && handleItemClick(actualIndex)}
            >
              <span
                className="flex w-full items-center justify-center text-center"
                style={{
                  height: `${itemHeight}px`,
                  lineHeight: '1',
                }}
              >
                {option.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* iOS 스타일 페이드 효과 */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 z-20"
        style={{
          height: `${centerIndex * itemHeight}px`,
          background:
            'linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-20"
        style={{
          height: `${centerIndex * itemHeight}px`,
          background:
            'linear-gradient(to top, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%)',
        }}
      />
    </div>
  );
};
