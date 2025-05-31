import { TransactionsResponse } from '@/app/api/transactions/types';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useTransactionFilter(
  transactions: TransactionsResponse['list']
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState<
    TransactionsResponse['list']
  >([]);
  const [isNationalSizeOnly, setIsNationalSizeOnly] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout>();

  const debouncedFilter = useCallback(() => {
    const filtered = transactions.filter(transaction => {
      const matchesSearch = transaction.apartName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      if (isNationalSizeOnly) {
        const matchesSize = transaction.size >= 84 && transaction.size < 85;
        return matchesSearch && matchesSize;
      }

      return matchesSearch;
    });

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, isNationalSizeOnly]);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      debouncedFilter();
    }, 200);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [debouncedFilter]);

  useEffect(() => {
    if (transactions.length > 0) {
      debouncedFilter();
    }
  }, [transactions, debouncedFilter]);

  return {
    searchTerm,
    isNationalSizeOnly,
    filteredTransactions,
    setSearchTerm,
    setIsNationalSizeOnly,
  };
}
