import { ApartDetailTradeHistoryItem } from '@/app/api/apart/types';

import { PERIODS } from '../consts/config';

export interface TradeItemWithPriceChangeRate
  extends ApartDetailTradeHistoryItem {
  priceChangeRate: number;
  previousTradeItem?: ApartDetailTradeHistoryItem;
}

export type PeriodValue = (typeof PERIODS)[number]['value'];

export type SizesValue = Set<number>;
