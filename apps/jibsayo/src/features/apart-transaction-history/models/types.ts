import { ApartDetailTradeHistoryItem } from '@/app/api/apart/types';

export interface TradeItemWithPriceChangeRate
  extends ApartDetailTradeHistoryItem {
  priceChangeRate: number;
}
