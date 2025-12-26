import { SearchedApartmentItem } from '@/entities/apart';
import { PageContainer } from '@/shared/ui/PageContainer';

import { SearchInput } from './SearchInput';
import { SearchResult } from './SearchResult';

interface ApartSearchProps {
  isFetching: boolean;
  showsItems: boolean;
  items: SearchedApartmentItem[];
  selectedApartIds: number[];
  apartNameValue: string;
  apartNameParam: string;
  onChange: (value: string) => void;
  onSelect: (item: SearchedApartmentItem) => void;
  onFocus: () => void;
  onBlur: () => void;
}

export function ApartSearch({
  isFetching,
  showsItems,
  items,
  selectedApartIds,
  apartNameValue,
  apartNameParam,
  onChange,
  onSelect,
  onFocus,
  onBlur,
}: ApartSearchProps) {
  return (
    <PageContainer className="flex flex-col gap-y-2">
      <div className="flex flex-col gap-y-5">
        <SearchInput
          apartNameValue={apartNameValue}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {showsItems && (
          <SearchResult
            isFetching={isFetching}
            items={items}
            selectedApartIds={selectedApartIds}
            apartName={apartNameParam}
            onSelect={onSelect}
          />
        )}
      </div>
    </PageContainer>
  );
}
