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

interface CartState {
  items: CartItem[];
  deliveryLocation: 'pangyo' | 'jeju';
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  setDeliveryLocation: (location: 'pangyo' | 'jeju') => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      deliveryLocation: 'pangyo',
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
      clear: () => set({ items: [], deliveryLocation: 'pangyo' }),
    }),
    { name: 'employee-mall-cart' },
  ),
);
