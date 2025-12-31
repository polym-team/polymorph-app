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
    selectedSizesByApart,
    availableSizesByApart,
    apartNameValue,
    apartNameParam,
    focusSearchInput,
    blurSearchInput,
    changeApartName,
    clickApartItem,
    toggleApartSize,
    setAvailableSizesByApart,
    setSelectedSizesByApart,
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
            selectedAparts={selectedAparts}
            selectedSizesByApart={selectedSizesByApart}
            availableSizesByApart={availableSizesByApart}
            setAvailableSizesByApart={setAvailableSizesByApart}
            setSelectedSizesByApart={setSelectedSizesByApart}
            onRemoveApartId={apartId => {
              clickApartItem(selectedAparts.find(item => item.id === apartId)!);
            }}
            onToggleSize={toggleApartSize}
          />
          <CompareAparts
            selectedApartIds={selectedApartIds}
            selectedSizesByApart={selectedSizesByApart}
            items={selectedAparts}
          />
        </>
      )}
    </div>
  );
}
