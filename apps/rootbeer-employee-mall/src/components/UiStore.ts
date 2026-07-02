import { create } from 'zustand';

/** 전역 UI 오버레이 상태 (검색 오버레이 / 장바구니 드로어) */
interface UiState {
  searchOpen: boolean;
  cartOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  searchOpen: false,
  cartOpen: false,
  openSearch: () => set({ searchOpen: true, cartOpen: false }),
  closeSearch: () => set({ searchOpen: false }),
  openCart: () => set({ cartOpen: true, searchOpen: false }),
  closeCart: () => set({ cartOpen: false }),
}));
