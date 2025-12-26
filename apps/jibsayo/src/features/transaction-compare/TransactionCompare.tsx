'use client';

import { CompareAparts } from './sub-features/compare-aparts';
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
    selectedAparts,
    apartNameValue,
    apartNameParam,
    focusSearchInput,
    blurSearchInput,
    changeApartName,
    clickApartItem,
  } = useTransactionCompare();

  return (
    <div className="flex flex-col gap-y-3">
      <ApartSearch
        isFetching={isFetching}
        showsItems={showsItems}
        items={items}
        selectedApartIds={selectedApartIds}
        apartNameValue={apartNameValue}
        apartNameParam={apartNameParam}
        onChange={changeApartName}
        onSelect={clickApartItem}
        onFocus={focusSearchInput}
        onBlur={blurSearchInput}
      />
      {selectedApartIds.length === 0 && !isFetching && <NotSearched />}
      {selectedApartIds.length > 0 && (
        <>
          <CompareChart
            selectedApartIds={selectedApartIds}
            onRemoveApartId={apartId => {
              clickApartItem(selectedAparts.find(item => item.id === apartId)!);
            }}
          />
          <CompareAparts
            selectedApartIds={selectedApartIds}
            items={selectedAparts}
          />
        </>
      )}
    </div>
  );
}
