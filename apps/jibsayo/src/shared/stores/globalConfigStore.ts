import { create } from 'zustand';

import { getDeviceId } from '../services/webviewService';

interface GlobalConfigStore {
  isInApp: boolean;
  deviceId: string;
}

export const useGlobalConfigStore = create<GlobalConfigStore>(() => {
  const deviceId = getDeviceId();

  return {
    isInApp: !!deviceId,
    deviceId,
  };
});
