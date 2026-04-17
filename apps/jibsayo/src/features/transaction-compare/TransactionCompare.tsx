'use client';

import dynamic from 'next/dynamic';

import { CompareAparts } from './sub-features/compare-aparts';
import { ApartSearch } from './ui/ApartSearch';

const CompareChart = dynamic(
  () =>
    import('./sub-features/compare-chart').then(mod => mod.CompareChart),
  { ssr: false }
);
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
    favoriteAparts,
    focusSearchInput,
    blurSearchInput,
    changeApartName,
    clickApartItem,
    clickFavoriteApart,
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
        favoriteAparts={favoriteAparts}
        onChange={changeApartName}
        onSelect={clickApartItem}
        onFocus={focusSearchInput}
        onBlur={blurSearchInput}
        onClickFavoriteApart={clickFavoriteApart}
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
            items={selectedAparts}
            selectedPeriod={60}
            selectedSizesByApart={selectedSizesByApart}
            availableSizesByApart={availableSizesByApart}
          />
        </>
      )}
    </div>
  );
}
