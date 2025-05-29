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
  placeholder = '월을 선택하세요',
  disabled = false,
  className,
}: MonthPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [currentYear, setCurrentYear] = React.useState(
    value?.getFullYear() || new Date().getFullYear()
  );

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

  const handleYearChange = (direction: 'prev' | 'next') => {
    setCurrentYear(prev => (direction === 'prev' ? prev - 1 : prev + 1));
  };

  // 이전달/다음달 네비게이션
  const handleMonthNavigation = (direction: 'prev' | 'next') => {
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

  return (
    <div className={cn('relative flex items-center', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-center pl-12 pr-12 text-center font-normal',
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
          variant="ghost"
          size="icon"
          onClick={() => handleMonthNavigation('prev')}
          disabled={disabled}
          className="hover:bg-accent absolute left-1 top-1/2 z-10 h-7 w-7 -translate-y-1/2"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* 다음달 버튼 - 절대 위치 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleMonthNavigation('next')}
          disabled={disabled}
          className="hover:bg-accent absolute right-1 top-1/2 z-10 h-7 w-7 -translate-y-1/2"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <PopoverContent className="w-auto p-4">
          <div className="space-y-4">
            {/* Year Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleYearChange('prev')}
                className="h-7 w-7"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="font-semibold">{currentYear}년</div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleYearChange('next')}
                className="h-7 w-7"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Month Grid */}
            <div className="grid grid-cols-3 gap-2">
              {months.map((month, index) => (
                <Button
                  key={month}
                  variant={
                    value &&
                    value.getFullYear() === currentYear &&
                    value.getMonth() === index
                      ? 'primary'
                      : 'outline'
                  }
                  size="sm"
                  onClick={() => handleMonthSelect(index)}
                  className="h-9"
                >
                  {month}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
