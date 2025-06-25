export interface TransactionPageSearchParams {
  regionCode: string;
  tradeDate: string;
}

export interface TransactionItem {
  tradeDate: string;
  size: number;
  floor: number;
  tradeAmount: number;
  pricePerPyeong: number;
  pyeong: number;
  priceChange?: {
    change: string;
    isUp: boolean;
    isDown: boolean;
    previousPrice?: number;
    previousDate?: string;
  } | null;
}
