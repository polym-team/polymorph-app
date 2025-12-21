'use client';

import { CompareChart } from './sub-features/compare-chart';
import { ApartSearch } from './ui/ApartSearch';
import { NotSearched } from './ui/NotSearched';
import { useTransactionCompare } from './useTransactionCompare';

export function TransactionCompare() {
  const {
    isFetching,
    showsItems,
    items,
    selectedApartIds,
    apartNameValue,
    focusSearchInput,
    blurSearchInput,
    changeApartName,
    clickApartItem,
  } = useTransactionCompare();

  return (
    <div className="flex flex-col gap-y-6">
      <ApartSearch
        isFetching={isFetching}
        showsItems={showsItems}
        items={items}
        selectedApartIds={selectedApartIds}
        apartNameValue={apartNameValue}
        onChange={changeApartName}
        onSelect={clickApartItem}
        onFocus={focusSearchInput}
        onBlur={blurSearchInput}
      />
      {selectedApartIds.length === 0 && <NotSearched />}
      {selectedApartIds.length > 0 && (
        <CompareChart
          selectedApartIds={selectedApartIds}
          onRemoveApartId={apartId => {
            clickApartItem(items.find(item => item.id === apartId)!);
          }}
        />
      )}
    </div>
  );
}
