import { useEffect, useRef, useState } from 'react';

import { Typography } from '@package/ui';

interface CollapsibleFilterProps {
  title: string;
  value: string;
  children: React.ReactNode;
  className?: string;
  hasActiveFilter?: boolean;
}

export function CollapsibleFilter({
  title,
  value,
  children,
  className = '',
  hasActiveFilter = false,
}: CollapsibleFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
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
        {/* 상단 헤더 - 두 상태에서 공통 사용 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex h-[35px] w-full items-center justify-between rounded-sm px-3 text-left transition-colors hover:bg-gray-50"
        >
          <Typography variant="small" className="text-sm font-medium">
            {title}
          </Typography>
          <div className="ml-4 flex min-w-0 flex-1 items-center justify-end gap-2">
            <div className="min-w-0 flex-1" title={value}>
              <Typography
                variant="small"
                className="block truncate text-right text-sm text-gray-600"
              >
                {value}
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
          <div className="animate-in fade-in slide-in-from-top-2 scale-in-95 absolute left-0 right-0 top-full z-50 rounded-b-sm border-b border-l border-r border-gray-200 bg-white p-3 shadow-lg duration-200">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
