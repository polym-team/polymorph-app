import { useState } from 'react';

import { Typography } from '@package/ui';

interface CollapsibleFilterProps {
  title: string;
  value: string;
  children: React.ReactNode;
  className?: string;
  customHeader?: React.ReactNode;
}

export function CollapsibleFilter({
  title,
  value,
  children,
  className = '',
  customHeader,
}: CollapsibleFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`w-full sm:w-[420px] ${className}`}>
      <div className="rounded-sm border border-gray-200 bg-white transition-all">
        {/* 상단 헤더 - 두 상태에서 공통 사용 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-gray-50"
        >
          {customHeader || (
            <>
              <Typography variant="small" className="text-sm font-medium">
                {title}
              </Typography>
              <div className="flex items-center gap-2">
                <Typography variant="small" className="text-sm text-gray-600">
                  {value}
                </Typography>
                <svg
                  className={`h-4 w-4 text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
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
            </>
          )}
        </button>

        {/* 펼쳐진 상태에서만 내용 표시 */}
        {isExpanded && <div className="p-3">{children}</div>}
      </div>
    </div>
  );
}
