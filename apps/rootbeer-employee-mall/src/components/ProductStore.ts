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

export interface ProductOptionItem {
  id: number;
  name: string;
  salePrice: number | null;
  stock: number;
  soldOut: boolean;
}

interface ProductDetailModalState {
  productId: number | null;
  cardRect: CardRect | null;
  previewProduct: PreviewProduct | null;
  isClosing: boolean;
  options: ProductOptionItem[];
  selectedOption: ProductOptionItem | null;
  open: (id: number, rect: CardRect, preview: PreviewProduct) => void;
  startClose: () => void;
  close: () => void;
  setOptions: (options: ProductOptionItem[]) => void;
  selectOption: (option: ProductOptionItem | null) => void;
}

export const useProductDetailModal = create<ProductDetailModalState>()((set) => ({
  productId: null,
  cardRect: null,
  previewProduct: null,
  isClosing: false,
  options: [],
  selectedOption: null,
  open: (id, rect, preview) => {
    window.history.pushState({ productDetail: id }, '', `/products/${id}`);
    set({ productId: id, cardRect: rect, previewProduct: preview, isClosing: false, options: [], selectedOption: null });
  },
  startClose: () => set({ isClosing: true }),
  close: () => {
    set({ productId: null, cardRect: null, previewProduct: null, isClosing: false, options: [], selectedOption: null });
  },
  setOptions: (options) => set({ options }),
  selectOption: (option) => set({ selectedOption: option }),
}));
