import { create } from 'zustand';

interface CardRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface ProductDetailModalState {
  productId: number | null;
  cardRect: CardRect | null;
  open: (id: number, rect: CardRect) => void;
  close: () => void;
}

export const useProductDetailModal = create<ProductDetailModalState>()((set) => ({
  productId: null,
  cardRect: null,
  open: (id, rect) => {
    window.history.pushState({ productDetail: id }, '', `/products/${id}`);
    set({ productId: id, cardRect: rect });
  },
  close: () => {
    set({ productId: null, cardRect: null });
  },
}));
