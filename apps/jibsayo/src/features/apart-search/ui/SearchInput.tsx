import { HorizontalScrollContainer } from '@/shared/ui/HorizontalScrollContainer';
import { PageContainer } from '@/shared/ui/PageContainer';

import { Search, X } from 'lucide-react';

import { Button } from '@package/ui';

interface SearchInputProps {
  value: string;
  recentSearchedApartNames: string[];
  onChangeValue: (value: string) => void;
  onRemoveRecentSearchedApartName: (name: string) => void;
}

export function SearchInput({
  value,
  recentSearchedApartNames,
  onChangeValue,
  onRemoveRecentSearchedApartName,
}: SearchInputProps) {
  return (
    <PageContainer className="flex flex-col gap-y-4">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-[10px] text-gray-300"
          size={20}
        />
        {value && (
          <X
            size={20}
            className="absolute right-3 top-1/2 -translate-y-[10px] cursor-pointer text-gray-400"
            onClick={() => onChangeValue('')}
          />
        )}
        <input
          className="w-full rounded bg-gray-100 p-4 pl-10 outline-none"
          placeholder="아파트 이름으로 검색"
          value={value}
          onChange={e => onChangeValue(e.target.value)}
        />
      </div>
      {recentSearchedApartNames.length > 0 && (
        <div className="flex flex-col gap-x-3 gap-y-1">
          <span className="text-sm text-gray-500">최근 검색</span>
          <div className="scrollbar-hide flex-1 overflow-y-auto">
            <HorizontalScrollContainer className="gap-1">
              {recentSearchedApartNames.map(item => (
                <Button
                  key={item}
                  size="sm"
                  variant="outline"
                  rounded
                  onClick={() => onChangeValue(item)}
                >
                  {item}
                  <span
                    className="-translate-y-[1px]"
                    onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      onRemoveRecentSearchedApartName(item);
                    }}
                  >
                    <X />
                  </span>
                </Button>
              ))}
            </HorizontalScrollContainer>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
