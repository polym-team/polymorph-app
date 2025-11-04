import { ApartDetailTradeHistoryItem } from '@/app/api/apart/models/types';
import { TransactionItem } from '@/entities/transaction';
import { calculateAreaPyeong } from '@/shared/services/transactionService';

import { subMonths } from 'date-fns';

import { PeriodValue, SizesValue } from '../models/types';

export const filterTradeItems = (
  tradeItems: ApartDetailTradeHistoryItem[],
  filters: { selectedPeriod: PeriodValue; selectedSizes: SizesValue }
): ApartDetailTradeHistoryItem[] => {
  const { selectedPeriod, selectedSizes } = filters;
  const now = new Date();

  return tradeItems.filter(item => {
    const tradeDate = new Date(item.tradeDate);

    const passWithPeriod =
      selectedPeriod === '0'
        ? true
        : tradeDate >= subMonths(now, Number(selectedPeriod));
    const passWithSelectedSizes = selectedSizes.has(
      calculateAreaPyeong(item.size)
    );

    return passWithPeriod && passWithSelectedSizes;
  });
};

export const filterNewTransactionList = (
  newTransactionList: TransactionItem[],
  apartName: string
): TransactionItem[] => {
  return newTransactionList.filter(item => item.apartName === apartName);
};
