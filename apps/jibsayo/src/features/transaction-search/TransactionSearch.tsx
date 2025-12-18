'use client';

import { PageContainer } from '@/shared/ui/PageContainer';

import { Button } from '@package/ui';

import { useTransactionSearch } from './hooks/useTransactionSearch';
import { FilterForm } from './sub-features/filter-form/FilterForm';
import { MonthSelect } from './sub-features/month-select/MonthSelect';
import { RegionSelect } from './sub-features/region-select/RegionSelect';

export function TransactionSearch() {
  const {
    isLoading,
    searchForm,
    filterForm,
    updateSearchForm,
    updateFilterForm,
    searchTransaction,
  } = useTransactionSearch();

  return (
    <PageContainer className="py-6" bgColor="white">
      <form
        className="flex flex-col gap-2 lg:flex-row"
        onSubmit={e => {
          e.preventDefault();
          searchTransaction();
        }}
      >
        <div className="lg:w-52">
          <RegionSelect form={searchForm} onFormChange={updateSearchForm} />
        </div>
        <div className="lg:w-52">
          <MonthSelect form={searchForm} onFormChange={updateSearchForm} />
        </div>
        <div className="lg:w-60">
          <FilterForm form={filterForm} onFormChange={updateFilterForm} />
        </div>
        <Button isLoading={isLoading} type="submit" variant="primary">
          검색
        </Button>
      </form>
    </PageContainer>
  );
}
