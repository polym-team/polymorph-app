import { create } from 'zustand';

interface GlobalConfigStore {
  isInApp: boolean;
  deviceId: string;
  init: (params: { isInApp: boolean; deviceId: string }) => void;
}

export const useGlobalConfigStore = create<GlobalConfigStore>(set => ({
  isInApp: true,
  deviceId: '',
  init: ({ isInApp, deviceId }) => set({ isInApp, deviceId }),
}));
