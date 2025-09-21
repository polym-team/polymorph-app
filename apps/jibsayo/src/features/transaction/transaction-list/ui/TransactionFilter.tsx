import { useEffect, useRef, useState } from 'react';

import { Button, Input, Typography } from '@package/ui';

import { SizeRangeSelector } from './SizeRangeSelector';

interface TransactionFilterProps {
  title: string;
  value: string;
  children: React.ReactNode;
  className?: string;
  hasActiveFilter?: boolean;
}

export function TransactionFilter({
  title,
  value,
  children,
  className = '',
  hasActiveFilter = false,
}: TransactionFilterProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외 영역 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full sm:w-[420px] ${className}`}
    >
      <div
        className={`rounded-sm border bg-white transition-all ${
          hasActiveFilter ? 'border-primary' : 'border-gray-200'
        }`}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex h-[40.5px] w-full items-center justify-between rounded-sm px-3 text-left transition-colors hover:bg-gray-50"
        >
          <Typography variant="small" className="text-sm font-medium">
            필터
          </Typography>
          <div className="ml-4 flex min-w-0 flex-1 items-center justify-end gap-2">
            <div className="min-w-0 flex-1" title={value}>
              <Typography
                variant="small"
                className="block truncate text-right text-sm text-gray-600"
              >
                적용된 필터 없음
              </Typography>
            </div>

            <svg
              className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ease-in-out ${
                isExpanded ? 'rotate-180' : 'rotate-0'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>

        {/* 펼쳐진 상태에서만 내용 표시 */}
        {isExpanded && (
          <div className="animate-in fade-in slide-in-from-top-2 scale-in-95 absolute left-0 right-0 top-full z-50 mt-1 rounded border bg-white shadow-lg duration-200">
            <div className="flex flex-col gap-2 p-3">
              <SizeRangeSelector
                minSize={0}
                maxSize={50}
                onRangeChange={() => {}}
              />
              <div>
                <Input size="sm" placeholder="아파트명" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="w-full">
                  저장된 아파트
                </Button>
                <Button size="sm" className="w-full">
                  신규 거래
                </Button>
              </div>
            </div>
            <hr />
            <div className="flex gap-2 p-3">
              <Button className="w-full" variant="outline">
                초기화
              </Button>
              <Button className="w-full" variant="primary">
                적용
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
