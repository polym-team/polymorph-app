import { create } from 'zustand';
import type { Product, OrderRound, Notice } from '@/types';

/**
 * 홈 카탈로그 상태를 세션 메모리에 유지한다.
 * 상품 상세로 이동했다가 뒤로 돌아올 때 재요청 없이 즉시 목록을 복원하고
 * (loaded 플래그), 필터 선택과 스크롤 위치도 보존한다.
 */

interface HydrateData {
  products: Product[];
  openRounds: OrderRound[];
  latestNotice: Notice | null;
  lastUpdated: string | null;
}

interface Preset {
  store?: string;
  brands?: string[];
  keyword?: string;
}

interface CatalogState {
  loaded: boolean;
  products: Product[];
  openRounds: OrderRound[];
  latestNotice: Notice | null;
  lastUpdated: string | null;
  // 필터
  storeFilter: string;
  selectedBrands: string[];
  keyword: string;
  // 뒤로가기 시 복원할 목록 스크롤 위치
  listScrollY: number;
  hydrate: (data: HydrateData, preset: Preset | null) => void;
  setStoreFilter: (v: string) => void;
  setSelectedBrands: (v: string[]) => void;
  setKeyword: (v: string) => void;
  setListScrollY: (y: number) => void;
}

export const useCatalogStore = create<CatalogState>()((set) => ({
  loaded: false,
  products: [],
  openRounds: [],
  latestNotice: null,
  lastUpdated: null,
  storeFilter: 'all',
  selectedBrands: [],
  keyword: '',
  listScrollY: 0,
  hydrate: (data, preset) =>
    set({
      products: data.products,
      openRounds: data.openRounds,
      latestNotice: data.latestNotice,
      lastUpdated: data.lastUpdated,
      loaded: true,
      storeFilter: preset?.store ?? 'all',
      selectedBrands: preset?.brands ?? [],
      keyword: preset?.keyword ?? '',
    }),
  setStoreFilter: (v) => set({ storeFilter: v }),
  setSelectedBrands: (v) => set({ selectedBrands: v }),
  setKeyword: (v) => set({ keyword: v }),
  setListScrollY: (y) => set({ listScrollY: y }),
}));
