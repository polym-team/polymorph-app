import { SearchIcon } from 'lucide-react';

export function NotSearched() {
  return (
    <div className="flex flex-col items-center gap-y-5 py-10">
      <SearchIcon className="text-gray-400" size={40} />
      <div className="flex flex-col items-center gap-y-1 text-center">
        <p className="font-semibold text-gray-600">아파트를 검색하세요</p>
        <p className="text-sm text-gray-500">
          아파트 이름을 입력하거나 최근 검색 목록에서 선택할 수 있어요
        </p>
      </div>
    </div>
  );
}
