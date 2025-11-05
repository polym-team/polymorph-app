'use client';

import { useOnceEffect } from '@/shared/hooks';
import { getDeviceId } from '@/shared/services/webviewService';
import { useGlobalConfigStore } from '@/shared/stores/globalConfigStore';

import { useState } from 'react';

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const initGlobalConfigStore = useGlobalConfigStore(state => state.init);

  const [isReady, setIsReady] = useState(false);

  const initConfig = () => {
    const deviceId = getDeviceId();
    const isInApp = Boolean(deviceId);

    initGlobalConfigStore({ isInApp, deviceId });
  };

  useOnceEffect(true, () => {
    initConfig();
    setIsReady(true);
  });

  if (!isReady) return null;

  return <>{children}</>;
}
