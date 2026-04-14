export enum Lotto645Mode {
  AUTO = 'auto',
  SEMIAUTO = 'semiauto',
  MANUAL = 'manual',
}

export interface Lotto645Ticket {
  mode: Lotto645Mode;
  numbers: number[];
}

export function createAutoTickets(count: number): Lotto645Ticket[] {
  return Array.from({ length: count }, () => ({
    mode: Lotto645Mode.AUTO,
    numbers: [],
  }));
}

export interface BalanceInfo {
  totalDeposit: number;
  purchasableAmount: number;
  reservedAmount: number;
  withdrawalPending: number;
  nonPurchasable: number;
  monthlyPurchaseTotal: number;
}

export interface BuySlot {
  mode: string;
  slot: string;
  numbers: string[];
}

export interface BuyResult {
  success: boolean;
  message: string;
  roundNo: number;
  slots: BuySlot[];
}

export interface PurchaseHistoryItem {
  purchaseDate: string;
  lotteryName: string;
  roundNo: string;
  numbers: string;
  quantity: number;
  winResult: string;
  winAmount: string;
  drawDate: string;
}
