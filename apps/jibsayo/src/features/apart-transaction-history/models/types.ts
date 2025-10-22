import { ApartDetailTradeHistoryItem } from '@/app/api/apart/types';

import { PERIODS } from '../consts/config';

export interface TradeItemViewModel extends ApartDetailTradeHistoryItem {
  priceChangeRate: number;
  previousTradeItem?: ApartDetailTradeHistoryItem;
  isNewTransaction: boolean;
}

export type PeriodValue = (typeof PERIODS)[number]['value'];

export type SizesValue = Set<number>;
