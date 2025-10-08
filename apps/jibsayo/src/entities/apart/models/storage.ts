import { create } from 'zustand';

import { FavoriteApartItem } from './types';

interface FavoriteApartListStore {
  favoriteApartList: FavoriteApartItem[];
  setFavoriteApartList: (favoriteApartList: FavoriteApartItem[]) => void;
}

export const useFavoriteApartListStore = create<FavoriteApartListStore>(
  set => ({
    favoriteApartList: [],
    setFavoriteApartList: (favoriteApartList: FavoriteApartItem[]) =>
      set({ favoriteApartList }),
  })
);
