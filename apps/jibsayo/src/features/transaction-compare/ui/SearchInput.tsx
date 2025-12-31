import { HorizontalScrollContainer } from '@/shared/ui/HorizontalScrollContainer';

import { Search, X } from 'lucide-react';

import { Button } from '@package/ui';

interface SearchInputProps {
  apartNameValue: string;
  favoriteAparts: { apartId: number; apartName: string }[];
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onClickFavoriteApart: (apartId: number, apartName: string) => void;
}

export function SearchInput({
  apartNameValue,
  favoriteAparts,
  onChange,
  onFocus,
  onBlur,
  onClickFavoriteApart,
}: SearchInputProps) {
  return (
    <div className="flex flex-col gap-y-4">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-[10px] text-gray-400"
          size={20}
        />
        {!!apartNameValue && (
          <X
            size={20}
            className="absolute right-3 top-1/2 -translate-y-[10px] cursor-pointer text-gray-500"
            onClick={() => onChange('')}
          />
        )}
        <input
          className="w-full rounded bg-gray-100 p-4 pl-10 outline-none"
          placeholder="비교할 아파트 이름으로 검색"
          value={apartNameValue}
          onChange={e => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </div>
      {favoriteAparts.length > 0 && (
        <div className="flex flex-col gap-x-3 gap-y-1">
          <span className="text-sm text-gray-500">저장된 아파트</span>
          <div className="scrollbar-hide flex-1 overflow-y-auto">
            <HorizontalScrollContainer className="gap-1">
              {favoriteAparts.map(item => (
                <Button
                  key={item.apartId}
                  size="sm"
                  variant="outline"
                  rounded
                  onClick={() => onClickFavoriteApart(item.apartId, item.apartName)}
                >
                  {item.apartName}
                </Button>
              ))}
            </HorizontalScrollContainer>
          </div>
        </div>
      )}
    </div>
  );
}
