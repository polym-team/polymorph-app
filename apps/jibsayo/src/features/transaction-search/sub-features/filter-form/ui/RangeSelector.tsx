import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@package/ui';

interface QuickSelectOption {
  label: string;
  min: number;
  max: number | typeof Infinity;
}

interface RangeSelectorProps {
  label: string;
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  step?: number;
  formatDisplay: (min: number, max: number) => string;
  quickSelectOptions: QuickSelectOption[];
  onRangeChange: (min: number, max: number) => void;
}

const HANDLE_RADIUS = 8;

export function RangeSelector({
  label,
  min,
  max,
  minValue,
  maxValue,
  step = 1,
  formatDisplay,
  quickSelectOptions,
  onRangeChange,
}: RangeSelectorProps) {
  const [localMin, setLocalMin] = useState(minValue ?? min);
  const [localMax, setLocalMax] = useState(maxValue ?? max);
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null);
  const [isSliderMounted, setIsSliderMounted] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const SLIDER_MAX = max + step;

  useEffect(() => {
    setLocalMin(minValue ?? min);
    setLocalMax(maxValue ?? max);
  }, [minValue, maxValue, min, max]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (sliderRef.current) {
        setIsSliderMounted(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const positionToValue = useCallback(
    (x: number): number | typeof Infinity => {
      if (!sliderRef.current) return min;

      const rect = sliderRef.current.getBoundingClientRect();
      const sliderWidth = rect.width;
      const relativeX = x - rect.left;
      const effectiveWidth = sliderWidth - HANDLE_RADIUS * 2;
      const clampedX = Math.max(
        HANDLE_RADIUS,
        Math.min(sliderWidth - HANDLE_RADIUS, relativeX)
      );
      const ratio = (clampedX - HANDLE_RADIUS) / effectiveWidth;

      const rawValue = min + ratio * (SLIDER_MAX - min);
      const steppedValue = Math.round(rawValue / step) * step;

      return steppedValue === SLIDER_MAX
        ? Infinity
        : Math.min(steppedValue, max);
    },
    [min, max, SLIDER_MAX, step]
  );

  const valueToPosition = (value: number): number => {
    if (!sliderRef.current || !isSliderMounted) return HANDLE_RADIUS;

    const rect = sliderRef.current.getBoundingClientRect();
    const sliderWidth = rect.width;

    const effectiveValue = value === Infinity ? SLIDER_MAX : value;

    const ratio = (effectiveValue - min) / (SLIDER_MAX - min);
    const effectiveWidth = sliderWidth - HANDLE_RADIUS * 2;
    return HANDLE_RADIUS + ratio * effectiveWidth;
  };

  const handleMouseDown = (e: React.MouseEvent, type: 'min' | 'max') => {
    e.preventDefault();
    setDragging(type);
  };

  const handleTouchStart = (e: React.TouchEvent, type: 'min' | 'max') => {
    e.preventDefault();
    setDragging(type);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!dragging) return;

      if ('touches' in e) {
        e.preventDefault();
      }

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const newValue = positionToValue(clientX);

      if (dragging === 'min') {
        const effectiveMax =
          localMax === Infinity ? max : Math.min(localMax, max);
        const clampedValue = Math.max(
          min,
          Math.min(newValue as number, effectiveMax)
        );
        setLocalMin(clampedValue);
      } else {
        if (newValue === Infinity) {
          setLocalMax(Infinity);
        } else {
          const clampedValue = Math.max(newValue as number, localMin);
          setLocalMax(clampedValue);
        }
      }
    },
    [dragging, localMax, localMin, positionToValue, min, max]
  );

  const handleMouseUp = useCallback(() => {
    if (dragging) {
      onRangeChange(localMin, localMax);

      const preventClick = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
      };

      document.addEventListener('click', preventClick, {
        capture: true,
        once: true,
      });
      setTimeout(() => {
        document.removeEventListener('click', preventClick, { capture: true });
      }, 0);
    }
    setDragging(null);
  }, [dragging, localMin, localMax, onRangeChange]);

  useEffect(() => {
    if (dragging) {
      const originalUserSelect = document.body.style.userSelect;
      document.body.style.userSelect = 'none';

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove, {
        passive: false,
      });
      document.addEventListener('touchend', handleMouseUp);

      return () => {
        document.body.style.userSelect = originalUserSelect;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleMouseMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [dragging, localMin, localMax, handleMouseMove, handleMouseUp]);

  const handleSliderClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (dragging) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clickValue = positionToValue(clientX);
    const distToMin = Math.abs(
      (clickValue === Infinity ? SLIDER_MAX : clickValue) - localMin
    );
    const effectiveLocalMax = localMax === Infinity ? SLIDER_MAX : localMax;
    const distToMax = Math.abs(
      (clickValue === Infinity ? SLIDER_MAX : clickValue) - effectiveLocalMax
    );

    if (distToMin <= distToMax) {
      const newMin = Math.max(
        min,
        Math.min(
          clickValue === Infinity ? max : clickValue,
          Math.min(effectiveLocalMax, max)
        )
      );
      setLocalMin(newMin);
      onRangeChange(newMin, localMax);
    } else {
      if (clickValue === Infinity) {
        setLocalMax(Infinity);
        onRangeChange(localMin, Infinity);
      } else {
        const newMax = Math.max(clickValue as number, localMin);
        setLocalMax(newMax);
        onRangeChange(localMin, newMax);
      }
    }
  };

  const handleQuickSelect = (range: {
    min: number;
    max: number | typeof Infinity;
  }) => {
    setLocalMin(range.min);
    setLocalMax(range.max);
    onRangeChange(range.min, range.max);
  };

  const minPosition = valueToPosition(localMin);
  const maxPosition = valueToPosition(localMax);

  const isOverlapping = Math.abs(minPosition - maxPosition) < 1;
  const shouldMinBeOnTop =
    isOverlapping &&
    localMin === max &&
    (localMax === max || localMax === Infinity);

  return (
    <div className="flex w-full flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <span className="block text-sm text-gray-500 lg:text-base">
          {label}
        </span>
        <span className="text-primary text-sm">
          {formatDisplay(localMin, localMax)}
        </span>
      </div>

      <div className="flex flex-col gap-y-3 rounded bg-gray-100 p-2 lg:p-3">
        <div className="flex w-full items-center justify-center rounded-full px-1 py-2 lg:px-2 lg:py-3">
          <div className="relative w-full">
            <div
              ref={sliderRef}
              className="relative cursor-pointer rounded-full bg-gray-200"
              style={{ height: '8px' }}
              onClick={handleSliderClick}
              onTouchStart={handleSliderClick}
            >
              <div
                className="bg-primary/80 absolute rounded-full"
                style={{
                  left: minPosition - HANDLE_RADIUS,
                  width: maxPosition - minPosition + HANDLE_RADIUS * 2,
                  height: '8px',
                }}
              />
            </div>

            <div
              className={`border-primary/80 absolute top-1/2 h-[24px] w-[24px] -translate-x-1/2 -translate-y-1/2 transform cursor-grab select-none rounded-full border-[3px] bg-white shadow-md transition-transform duration-200 ease-in-out ${
                dragging === 'max' ? 'scale-110 cursor-grabbing' : ''
              }`}
              style={{
                left: maxPosition,
                zIndex: shouldMinBeOnTop ? 1 : 2,
              }}
              onMouseDown={e => handleMouseDown(e, 'max')}
              onTouchStart={e => handleTouchStart(e, 'max')}
            />

            <div
              className={`border-primary/80 absolute top-1/2 h-[24px] w-[24px] -translate-x-1/2 -translate-y-1/2 transform cursor-grab select-none rounded-full border-[3px] bg-white shadow-md transition-transform duration-200 ease-in-out ${
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

        <div className="scrollbar-hide flex overflow-x-auto overflow-y-hidden pr-8">
          <div className="flex w-max gap-1">
            {quickSelectOptions.map(button => (
              <Button
                key={button.label}
                type="button"
                onClick={() => handleQuickSelect(button)}
                size="sm"
                rounded
                variant={
                  localMin === button.min && localMax === button.max
                    ? 'primary-light'
                    : 'outline'
                }
                className="whitespace-nowrap"
              >
                {button.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
