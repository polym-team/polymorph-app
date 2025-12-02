import { TransactionItem } from '../transactions/types';

export type NewTransactionItem = TransactionItem;

export interface PushNotificationItem {
  deviceId: string;
  apartName: string;
  regionCode: string;
  transactionCount: number;
  transactions: NewTransactionItem[];
}
