'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

interface SelectedMonthContextType {
  selectedMonth: string | null;
  setSelectedMonth: (month: string | null) => void;
}

const SelectedMonthContext = createContext<
  SelectedMonthContextType | undefined
>(undefined);

interface SelectedMonthProviderProps {
  children: ReactNode;
}

export const SelectedMonthProvider = ({
  children,
}: SelectedMonthProviderProps) => {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  return (
    <SelectedMonthContext.Provider value={{ selectedMonth, setSelectedMonth }}>
      {children}
    </SelectedMonthContext.Provider>
  );
};

export const useSelectedMonth = (): SelectedMonthContextType => {
  return useContext(SelectedMonthContext)!;
};
