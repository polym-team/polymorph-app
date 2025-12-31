'use client';

import { NotSearched } from './ui/NotSearched';
import { SearchInput } from './ui/SearchInput';
import { SearchResult } from './ui/SearchResult';
import { useApartSearch } from './useApartSearch';

export function ApartSearch() {
  const {
    isFetching,
    isEmpty,
    isShowItems,
    items,
    apartNameValue,
    apartNameParam,
    recentSearchedApartNames,
    changeApartName,
    toggleFavorite,
    clickApartItem,
    removeRecentSearchedApartName,
  } = useApartSearch();

  return (
    <div className="flex flex-col gap-y-3">
      <SearchInput
        value={apartNameValue}
        recentSearchedApartNames={recentSearchedApartNames}
        onChangeValue={changeApartName}
        onRemoveRecentSearchedApartName={removeRecentSearchedApartName}
      />
      {isEmpty && <NotSearched />}
      {isShowItems && apartNameParam && (
        <SearchResult
          isFetching={isFetching}
          apartName={apartNameParam}
          items={items}
          onClickItem={clickApartItem}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </div>
  );
}
