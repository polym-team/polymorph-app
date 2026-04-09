import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Store } from '@/types';

export interface CartItem {
  productId: number;
  optionId: number | null;
  optionName: string | null;
  name: string;
  brand: string | null;
  price: number;
  store: Store;
  imageUrl: string | null;
  quantity: number;
}

export interface CustomDelivery {
  name: string;
  phone: string;
  address: string;
}

interface CartState {
  items: CartItem[];
  deliveryLocation: 'pangyo' | 'jeju' | 'custom';
  customDelivery: CustomDelivery;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: number, optionId?: number | null) => void;
  updateQuantity: (productId: number, quantity: number, optionId?: number | null) => void;
  setDeliveryLocation: (location: 'pangyo' | 'jeju' | 'custom') => void;
  setCustomDelivery: (delivery: CustomDelivery) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      deliveryLocation: 'jeju',
      customDelivery: { name: '', phone: '', address: '' },
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.optionId === item.optionId,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.optionId === item.optionId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),
      removeItem: (productId, optionId) =>
        set((state) => ({
          items: state.items.filter((i) => !(i.productId === productId && i.optionId === (optionId ?? null))),
        })),
      updateQuantity: (productId, quantity, optionId) =>
        set((state) => {
          const match = (i: CartItem) => i.productId === productId && i.optionId === (optionId ?? null);
          return {
            items: quantity <= 0
              ? state.items.filter((i) => !match(i))
              : state.items.map((i) => (match(i) ? { ...i, quantity } : i)),
          };
        }),
      setDeliveryLocation: (location) => set({ deliveryLocation: location }),
      setCustomDelivery: (delivery) => set({ customDelivery: delivery }),
      clear: () => set({ items: [], deliveryLocation: 'jeju', customDelivery: { name: '', phone: '', address: '' } }),
    }),
    { name: 'employee-mall-cart' },
  ),
);
