import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Store } from '@/types';

export interface CartItem {
  productId: number;
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
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
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
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        })),
      setDeliveryLocation: (location) => set({ deliveryLocation: location }),
      setCustomDelivery: (delivery) => set({ customDelivery: delivery }),
      clear: () => set({ items: [], deliveryLocation: 'jeju', customDelivery: { name: '', phone: '', address: '' } }),
    }),
    { name: 'employee-mall-cart' },
  ),
);
