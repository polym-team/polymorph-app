'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';

import { cn } from '@package/utils';

import { BottomSheet } from './bottom-sheet';
import { Button } from './button';

interface MonthPickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const START_YEAR = 2006;

export function MonthPicker({
  value,
  onChange,
  placeholder = '월 선택',
  disabled = false,
  className,
}: MonthPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
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

  React.useEffect(() => {
    if (isOpen) {
      setCurrentYear(value?.getFullYear() || new Date().getFullYear());
    }
  }, [isOpen, value]);

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentYear, monthIndex, 1);
    onChange?.(newDate);
    setIsOpen(false);
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

  // value가 변경되면 currentYear도 업데이트
  React.useEffect(() => {
    if (value) {
      setCurrentYear(value.getFullYear());
    }
  }, [value]);

  // 팝오버가 열릴 때 현재 선택된 년도와 월에 스크롤
  React.useEffect(() => {
    if (isOpen && value) {
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
  }, [isOpen, value]);

  return (
    <div className={cn('relative flex items-center', className)}>
      {/* 이전달 버튼 - 절대 위치 */}
      <Button
        type="button"
        variant="ghost"
        onClick={() => handleMonthNavigation('prev')}
        disabled={disabled}
        className="active:bg-accent absolute left-0 top-0 z-10 h-full w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* 다음달 버튼 - 절대 위치 */}
      <Button
        type="button"
        variant="ghost"
        onClick={() => handleMonthNavigation('next')}
        disabled={disabled}
        className="active:bg-accent absolute right-0 top-0 z-10 h-full w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        className={cn(
          'w-full justify-center bg-gray-100 pl-12 pr-12 text-center text-sm font-normal active:scale-100 lg:text-base',
          !value && 'text-muted-foreground'
        )}
        disabled={disabled}
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center justify-center">
          {value ? (
            format(value, 'yyyy년 MM월', { locale: ko })
          ) : (
            <span>{placeholder}</span>
          )}
        </div>
      </Button>

      <BottomSheet isOpen={isOpen} size="xs" onClose={() => setIsOpen(false)}>
        <BottomSheet.Header>월 선택</BottomSheet.Header>
        <BottomSheet.Body>
          <div className="relative flex gap-x-2">
            <ul className="scrollbar-hide flex max-h-[60vh] w-1/2 flex-col overflow-y-auto overflow-x-hidden pb-28">
              {Array.from(
                { length: new Date().getFullYear() - START_YEAR + 1 },
                (_, i) => {
                  const year = START_YEAR + i;
                  return (
                    <li key={year}>
                      <button
                        type="button"
                        data-year={year}
                        onClick={() => setCurrentYear(year)}
                        className={cn(
                          'active:bg-accent lg:hover:bg-accent w-full rounded p-3 text-left text-sm transition-colors duration-300 lg:text-base',
                          currentYear === year && 'bg-accent text-primary'
                        )}
                      >
                        {year}년
                      </button>
                    </li>
                  );
                }
              )}
            </ul>
            <ul className="scrollbar-hide flex max-h-[50vh] w-1/2 flex-col overflow-y-auto overflow-x-hidden pb-28">
              {months.map((month, index) => (
                <li key={index}>
                  <button
                    type="button"
                    data-month={month}
                    onClick={() => handleMonthSelect(index)}
                    className={cn(
                      'active:bg-accent lg:hover:bg-accent w-full rounded p-3 text-left text-sm transition-colors duration-300 lg:text-base',
                      value &&
                        value.getMonth() === index &&
                        'bg-accent text-primary'
                    )}
                  >
                    {month}
                  </button>
                </li>
              ))}
            </ul>
            <div className="pointer-events-none absolute bottom-0 left-0 h-36 w-full bg-gradient-to-t from-white to-transparent" />
          </div>
        </BottomSheet.Body>
      </BottomSheet>
    </div>
  );
}
