'use client';

import { ROUTE_PATH } from '@/shared/consts/route';
import { useOnceEffect } from '@/shared/hooks';
import {
  getDeviceId,
  setOnClickBottomTabHandler,
} from '@/shared/services/webviewService';
import { useGlobalConfigStore } from '@/shared/stores/globalConfigStore';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function WebviewProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initGlobalConfigStore = useGlobalConfigStore(state => state.init);

  const [isReady, setIsReady] = useState(false);

  const initConfig = () => {
    const isInApp = searchParams.get('inApp') === 'true';
    const deviceId = getDeviceId();

    initGlobalConfigStore({ isInApp, deviceId });
  };

  const setBottomTabClickHandler = () => {
    setOnClickBottomTabHandler(tabType => {
      switch (tabType) {
        case 'transaction':
          return router.push(ROUTE_PATH.TRANSACTION);
        case 'saved-apart':
          return router.push(ROUTE_PATH.APART);
      }
    });
  };

  useOnceEffect(true, () => {
    initConfig();
    setBottomTabClickHandler();

    setIsReady(true);
  });

  if (!isReady) return null;

  return <>{children}</>;
}
