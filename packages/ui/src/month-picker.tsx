'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import * as React from 'react';

import { cn } from '@package/utils';

import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface MonthPickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function MonthPicker({
  value,
  onChange,
  placeholder = '월 선택',
  disabled = false,
  className,
}: MonthPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [currentYear, setCurrentYear] = React.useState(() => {
    return value?.getFullYear() || new Date().getFullYear();
  });
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const months = [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ];

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentYear, monthIndex, 1);
    onChange?.(newDate);
    setOpen(false);
  };

  // 이전달/다음달 네비게이션
  const handleMonthNavigation = (direction: 'prev' | 'next') => {
    if (!isMounted) return;

    if (!value) {
      // 값이 없으면 현재 날짜 기준으로 시작
      const now = new Date();
      const targetMonth =
        direction === 'prev' ? now.getMonth() - 1 : now.getMonth() + 1;
      const targetYear = now.getFullYear();

      if (targetMonth < 0) {
        onChange?.(new Date(targetYear - 1, 11, 1));
      } else if (targetMonth > 11) {
        onChange?.(new Date(targetYear + 1, 0, 1));
      } else {
        onChange?.(new Date(targetYear, targetMonth, 1));
      }
      return;
    }

    const currentMonth = value.getMonth();
    const currentYear = value.getFullYear();

    if (direction === 'prev') {
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      onChange?.(new Date(prevYear, prevMonth, 1));
    } else {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      onChange?.(new Date(nextYear, nextMonth, 1));
    }
  };

  // 키보드 네비게이션 핸들러
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!value) return;

    const currentMonth = value.getMonth();
    const currentYear = value.getFullYear();

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        handleMonthNavigation('prev');
        break;

      case 'ArrowRight':
        event.preventDefault();
        handleMonthNavigation('next');
        break;

      case 'ArrowUp':
        event.preventDefault();
        // 3개월 이전 (같은 열의 위쪽)
        const upMonth = currentMonth - 3;
        if (upMonth >= 0) {
          onChange?.(new Date(currentYear, upMonth, 1));
        } else {
          onChange?.(new Date(currentYear - 1, upMonth + 12, 1));
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        // 3개월 이후 (같은 열의 아래쪽)
        const downMonth = currentMonth + 3;
        if (downMonth <= 11) {
          onChange?.(new Date(currentYear, downMonth, 1));
        } else {
          onChange?.(new Date(currentYear + 1, downMonth - 12, 1));
        }
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        setOpen(!open);
        break;

      case 'Escape':
        event.preventDefault();
        setOpen(false);
        break;
    }
  };

  // value가 변경되면 currentYear도 업데이트
  React.useEffect(() => {
    if (value) {
      setCurrentYear(value.getFullYear());
    }
  }, [value]);

  // 팝오버가 열릴 때 현재 선택된 년도와 월에 스크롤
  React.useEffect(() => {
    if (open && value) {
      // DOM이 완전히 렌더링된 후에 스크롤 실행
      setTimeout(() => {
        // 년도 스크롤
        const yearButton = document.querySelector(
          `[data-year="${value.getFullYear()}"]`
        ) as HTMLElement;
        if (yearButton) {
          yearButton.scrollIntoView({ behavior: 'instant', block: 'center' });
        }

        // 월 스크롤
        const monthButton = document.querySelector(
          `[data-month="${value.getMonth()}"]`
        ) as HTMLElement;
        if (monthButton) {
          monthButton.scrollIntoView({ behavior: 'instant', block: 'center' });
        }
      }, 0);
    }
  }, [open, value]);

  return (
    <div className={cn('relative flex items-center', className)}>
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              'w-full justify-center pl-12 pr-12 text-center font-normal active:scale-100',
              !value && 'text-muted-foreground'
            )}
            disabled={disabled}
            onKeyDown={handleKeyDown}
          >
            <div className="flex items-center justify-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? (
                format(value, 'yyyy년 MM월', { locale: ko })
              ) : (
                <span>{placeholder}</span>
              )}
            </div>
          </Button>
        </PopoverTrigger>

        {/* 이전달 버튼 - 절대 위치 */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => handleMonthNavigation('prev')}
          disabled={disabled}
          className="absolute left-1 top-1/2 z-10 h-full w-7 -translate-y-1/2 active:scale-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* 다음달 버튼 - 절대 위치 */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => handleMonthNavigation('next')}
          disabled={disabled}
          className="absolute right-1 top-1/2 z-10 h-full w-7 -translate-y-1/2 active:scale-100"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <div className="flex h-[344px]">
            {/* Year Selection - Left Side */}
            <div className="w-full flex-1 border-r">
              <div
                className="h-full overflow-y-auto p-1"
                style={{
                  scrollBehavior: 'smooth',
                  overscrollBehavior: 'auto',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {Array.from(
                  { length: new Date().getFullYear() - 2000 + 1 },
                  (_, i) => {
                    const year = 2000 + i;
                    return (
                      <button
                        key={year}
                        type="button"
                        data-year={year}
                        onClick={() => {
                          setCurrentYear(year);
                          // 년도 변경 시 현재 선택된 월을 유지하면서 새로운 날짜 생성
                          if (value) {
                            const newDate = new Date(year, value.getMonth(), 1);
                            onChange?.(newDate);
                          }
                        }}
                        className={cn(
                          'hover:bg-accent hover:text-accent-foreground w-full rounded-md px-3 py-2 text-center transition-colors',
                          value?.getFullYear() === year &&
                            'bg-accent text-accent-foreground'
                        )}
                      >
                        {year}년
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Month Selection - Right Side */}
            <div className="w-full flex-1">
              <div
                className="h-full overflow-y-auto p-1"
                style={{
                  scrollBehavior: 'smooth',
                  overscrollBehavior: 'auto',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {months.map((month, index) => (
                  <button
                    key={month}
                    type="button"
                    data-month={index}
                    onClick={() => handleMonthSelect(index)}
                    className={cn(
                      'hover:bg-accent hover:text-accent-foreground w-full rounded-md px-3 py-2 text-center transition-colors',
                      value &&
                        value.getFullYear() === currentYear &&
                        value.getMonth() === index &&
                        'bg-accent text-accent-foreground'
                    )}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
