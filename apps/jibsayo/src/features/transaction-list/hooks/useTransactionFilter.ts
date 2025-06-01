import { useState } from 'react';

interface Return {
  searchTerm: string;
  isNationalSizeOnly: boolean;
  isFavoriteOnly: boolean;
  setSearchTerm: (value: string) => void;
  setIsNationalSizeOnly: (value: boolean) => void;
  setIsFavoriteOnly: (value: boolean) => void;
}

export function useTransactionFilter(): Return {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNationalSizeOnly, setIsNationalSizeOnly] = useState(false);
  const [isFavoriteOnly, setIsFavoriteOnly] = useState(false);

  return {
    searchTerm,
    isNationalSizeOnly,
    isFavoriteOnly,
    setSearchTerm,
    setIsNationalSizeOnly,
    setIsFavoriteOnly,
  };
}
