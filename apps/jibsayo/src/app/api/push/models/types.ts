import { TransactionItem } from '../../transactions/models/types';

export type NewTransactionItem = TransactionItem;

export interface PushNotificationItem {
  deviceId: string;
  apartName: string;
  regionCode: string;
  transactionCount: number;
  transactions: NewTransactionItem[];
}
