import { create } from 'zustand';

interface GlobalConfigStore {
  isInApp: boolean;
  deviceId: string;
}

declare global {
  interface Window {
    jibsayo?: { deviceId?: string };
  }
}

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  window.jibsayo = { deviceId: 'test-device-id' };
}

const getDeviceId = (): string => {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.jibsayo?.deviceId ?? '';
};

export const useGlobalConfigStore = create<GlobalConfigStore>(() => {
  const deviceId = getDeviceId();

  return {
    isInApp: !!deviceId,
    deviceId,
  };
});
