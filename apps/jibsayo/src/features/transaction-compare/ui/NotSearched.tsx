import { ChartLine } from 'lucide-react';

import { MAX_COMPARE_APART_COUNT } from '../consts';

export function NotSearched() {
  return (
    <div className="flex flex-col items-center gap-y-5 py-10">
      <ChartLine className="text-gray-400" size={40} />
      <div className="flex flex-col items-center gap-y-1">
        <p className="font-semibold text-gray-600">
          비교할 아파트를 검색하세요
        </p>
        <p className="text-sm text-gray-500">
          최대{' '}
          <span className="text-primary font-semibold">
            {MAX_COMPARE_APART_COUNT}개
          </span>
          까지 비교할 수 있어요
        </p>
      </div>
    </div>
  );
}
