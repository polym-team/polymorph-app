'use client';

import { RULES } from '@/entities/transaction';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Button, Typography } from '@package/ui';

interface SizeRangeSelectorProps {
  minSize: number;
  maxSize: number;
  onRangeChange: (min: number, max: number) => void;
}

const HANDLE_RADIUS = 10; // 핸들 반지름 (w-4 + border-2 = 20px / 2)

export function SizeRangeSelector({
  minSize,
  maxSize,
  onRangeChange,
}: SizeRangeSelectorProps) {
  const [localMin, setLocalMin] = useState(minSize ?? RULES.SEARCH_MIN_SIZE);
  const [localMax, setLocalMax] = useState(maxSize ?? RULES.SEARCH_MAX_SIZE);
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null);
  const [isSliderMounted, setIsSliderMounted] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // 외부 값 변경 시 동기화
  useEffect(() => {
    setLocalMin(minSize ?? RULES.SEARCH_MIN_SIZE);
    setLocalMax(maxSize ?? RULES.SEARCH_MAX_SIZE);
  }, [minSize, maxSize]);

  // 슬라이더가 마운트된 후 위치 재계산
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sliderRef.current) {
        setIsSliderMounted(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // 위치를 평수로 변환
  const positionToValue = useCallback((x: number): number => {
    if (!sliderRef.current) return RULES.SEARCH_MIN_SIZE;

    const rect = sliderRef.current.getBoundingClientRect();
    const sliderWidth = rect.width;
    const relativeX = x - rect.left;
    // 핸들 반지름을 고려한 유효 범위 계산
    const effectiveWidth = sliderWidth - HANDLE_RADIUS * 2;
    const clampedX = Math.max(
      HANDLE_RADIUS,
      Math.min(sliderWidth - HANDLE_RADIUS, relativeX)
    );
    const ratio = (clampedX - HANDLE_RADIUS) / effectiveWidth;

    return Math.round(
      RULES.SEARCH_MIN_SIZE +
        ratio * (RULES.SEARCH_MAX_SIZE - RULES.SEARCH_MIN_SIZE)
    );
  }, []);

  // 평수를 위치로 변환
  const valueToPosition = useCallback((value: number): number => {
    if (!sliderRef.current || !isSliderMounted) return HANDLE_RADIUS;

    const rect = sliderRef.current.getBoundingClientRect();
    const sliderWidth = rect.width;

    const ratio =
      (value - RULES.SEARCH_MIN_SIZE) /
      (RULES.SEARCH_MAX_SIZE - RULES.SEARCH_MIN_SIZE);
    // 핸들 반지름을 고려해서 위치 계산
    const effectiveWidth = sliderWidth - HANDLE_RADIUS * 2;
    return HANDLE_RADIUS + ratio * effectiveWidth;
  }, []);

  // 드래그 시작
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, type: 'min' | 'max') => {
      e.preventDefault();
      setDragging(type);
    },
    []
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, type: 'min' | 'max') => {
      e.preventDefault(); // 핸들에서만 기본 동작 방지
      setDragging(type);
    },
    []
  );

  // 드래그 중
  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!dragging) return;

      // 드래그 중일 때만 터치 스크롤 방지
      if ('touches' in e) {
        e.preventDefault();
      }

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const newValue = positionToValue(clientX);

      if (dragging === 'min') {
        const clampedValue = Math.max(
          RULES.SEARCH_MIN_SIZE,
          Math.min(newValue, localMax)
        );
        setLocalMin(clampedValue);
      } else {
        const clampedValue = Math.min(
          RULES.SEARCH_MAX_SIZE,
          Math.max(newValue, localMin)
        );
        setLocalMax(clampedValue);
      }
    },
    [dragging, localMax, localMin, positionToValue]
  );

  // 드래그 종료 - 이때 실제 필터 적용
  const handleMouseUp = useCallback(() => {
    if (dragging) {
      onRangeChange(localMin, localMax);
    }
    setDragging(null);
  }, [dragging, localMin, localMax, onRangeChange]);

  // 전역 이벤트 리스너
  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove, {
        passive: false,
      });
      document.addEventListener('touchend', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleMouseMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [dragging, localMin, localMax, handleMouseMove, handleMouseUp]);

  // 슬라이더 바 클릭/터치
  const handleSliderClick = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (dragging) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clickValue = positionToValue(clientX);
      const distToMin = Math.abs(clickValue - localMin);
      const distToMax = Math.abs(clickValue - localMax);

      if (distToMin <= distToMax) {
        const newMin = Math.max(
          RULES.SEARCH_MIN_SIZE,
          Math.min(clickValue, localMax)
        );
        setLocalMin(newMin);
        onRangeChange(newMin, localMax);
      } else {
        const newMax = Math.min(
          RULES.SEARCH_MAX_SIZE,
          Math.max(clickValue, localMin)
        );
        setLocalMax(newMax);
        onRangeChange(localMin, newMax);
      }
    },
    [dragging, localMin, localMax, onRangeChange, positionToValue]
  );

  // 평수대별 빠른 선택
  const handleQuickSelect = useCallback(
    (range: { min: number; max: number }) => {
      setLocalMin(range.min);
      setLocalMax(range.max);
      onRangeChange(range.min, range.max);
    },
    [onRangeChange]
  );

  const minPosition = valueToPosition(localMin);
  const maxPosition = valueToPosition(localMax);

  // 겹칠 때 우선순위 결정: 50에서 겹치면 min, 그 외에는 max
  const isOverlapping = Math.abs(minPosition - maxPosition) < 1;
  const shouldMinBeOnTop = isOverlapping && localMin === 50 && localMax === 50;

  const quickSelectButtons = [
    { label: '전체', min: 0, max: 50 },
    { label: '10평대', min: 10, max: 19 },
    { label: '20평대', min: 20, max: 29 },
    { label: '30평대', min: 30, max: 39 },
    { label: '40평대', min: 40, max: 49 },
    { label: '50평 이상', min: 50, max: 50 },
  ];

  return (
    <div className="flex w-full flex-col gap-3 rounded border p-3">
      {/* 헤더: 평수 제목과 현재 선택된 범위 */}
      <div className="flex items-center justify-between">
        <Typography variant="small" className="text-sm font-medium">
          평수
        </Typography>
        <Typography variant="small" className="text-sm text-gray-600">
          {localMin === 0 && localMax === 50
            ? '전체 평수'
            : `${localMin}~${localMax}평`}
        </Typography>
      </div>

      {/* 1행: Range Selector */}
      <div className="flex w-full items-center justify-center">
        <div className="relative w-full">
          {/* 슬라이더 트랙 */}
          <div
            ref={sliderRef}
            className="relative h-2 cursor-pointer rounded-lg bg-gray-200"
            onClick={handleSliderClick}
            onTouchStart={handleSliderClick}
          >
            {/* 활성 범위 */}
            <div
              className="bg-primary absolute h-2 rounded-lg"
              style={{
                left: minPosition,
                width: maxPosition - minPosition,
              }}
            />
          </div>

          {/* 최대값 핸들 */}
          <div
            className={`border-primary absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform cursor-grab select-none rounded-full border-2 bg-white shadow-md ${
              dragging === 'max' ? 'scale-110 cursor-grabbing' : ''
            }`}
            style={{
              left: maxPosition,
              zIndex: shouldMinBeOnTop ? 1 : 2,
            }}
            onMouseDown={e => handleMouseDown(e, 'max')}
            onTouchStart={e => handleTouchStart(e, 'max')}
          />

          {/* 최소값 핸들 */}
          <div
            className={`border-primary absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform cursor-grab select-none rounded-full border-2 bg-white shadow-md ${
              dragging === 'min' ? 'scale-110 cursor-grabbing' : ''
            }`}
            style={{
              left: minPosition,
              zIndex: shouldMinBeOnTop ? 2 : 1,
            }}
            onMouseDown={e => handleMouseDown(e, 'min')}
            onTouchStart={e => handleTouchStart(e, 'min')}
          />
        </div>
      </div>

      {/* 2행: 빠른 선택 버튼들 */}
      <div className="grid w-full grid-cols-6 gap-1">
        {quickSelectButtons.map(button => (
          <Button
            key={button.label}
            onClick={() => handleQuickSelect(button)}
            size="sm"
            variant={
              localMin === button.min && localMax === button.max
                ? 'primary'
                : 'default'
            }
            className="p-1.5 text-xs"
          >
            {button.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
