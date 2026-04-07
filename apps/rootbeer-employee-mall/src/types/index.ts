export type {
  User,
  Product,
  OrderRound,
  Order,
  OrderItem,
  Purchase,
  PurchaseItem,
  Notice,
} from '@prisma/client';

export type Store = 'amoremall' | 'innisfree';

export const STORE_LABELS: Record<Store, string> = {
  amoremall: '아모레몰',
  innisfree: '이니스프리',
};

export const DELIVERY_LABELS: Record<string, string> = {
  pangyo: 'axz판교오피스',
  jeju: 'axz제주오피스',
  custom: '특정 배송지',
};

export interface SettlementRow {
  user_id: number;
  user_name: string;
  user_email: string;
  items_total: number;
  shipping_share: number;
  total: number;
}

export const ADMIN_EMAIL = 'majac6@gmail.com';
