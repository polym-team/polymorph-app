import { create } from 'zustand';

interface CardRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface PreviewProduct {
  id: number;
  name: string;
  brand?: string | null;
  store: 'amoremall' | 'innisfree';
  salePrice: number;
  originPrice?: number | null;
  discountRate?: number | null;
  imageUrl?: string | null;
  soldOut: boolean;
}

interface ProductDetailModalState {
  productId: number | null;
  cardRect: CardRect | null;
  previewProduct: PreviewProduct | null;
  isClosing: boolean;
  open: (id: number, rect: CardRect, preview: PreviewProduct) => void;
  startClose: () => void;
  close: () => void;
}

export const useProductDetailModal = create<ProductDetailModalState>()((set) => ({
  productId: null,
  cardRect: null,
  previewProduct: null,
  isClosing: false,
  open: (id, rect, preview) => {
    window.history.pushState({ productDetail: id }, '', `/products/${id}`);
    set({ productId: id, cardRect: rect, previewProduct: preview, isClosing: false });
  },
  startClose: () => set({ isClosing: true }),
  close: () => {
    set({ productId: null, cardRect: null, previewProduct: null, isClosing: false });
  },
}));
