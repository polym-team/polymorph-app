import { Search, X } from 'lucide-react';

interface SearchInputProps {
  apartNameValue: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
}

export function SearchInput({
  apartNameValue,
  onChange,
  onFocus,
  onBlur,
}: SearchInputProps) {
  return (
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
  );
}
