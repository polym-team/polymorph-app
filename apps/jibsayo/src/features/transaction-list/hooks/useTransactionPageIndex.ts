import {
  useTransactionListQuery,
  useTransactionPageSearchParams,
} from '@/entities/transaction';

import { PageIndexState } from '../types';

export const useTransactionPageIndex = (): PageIndexState => {
  const { isFetching } = useTransactionListQuery();
  const { searchParams, setSearchParams } = useTransactionPageSearchParams();
  const pageIndex = Number(searchParams.pageIndex) ?? 0;

  const updatePageIndex = (newPageIndex: number) => {
    if (isFetching) return;
    setSearchParams({ pageIndex: newPageIndex });
  };

  return { state: pageIndex, update: updatePageIndex };
};
