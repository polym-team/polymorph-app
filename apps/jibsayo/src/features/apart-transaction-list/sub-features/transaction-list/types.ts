import { ApartTransactionItem } from '@/entities/apart-transaction';

export type Sorting = [{ id: keyof ApartTransactionItem; desc: boolean }];
