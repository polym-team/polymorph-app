'use client';

import { useOnceEffect } from '@/shared/hooks/useOnceEffect';
import { getDeviceId } from '@/shared/services/webview';
import { useAuthStore } from '@/shared/stores/authStore';
import { useGlobalConfigStore } from '@/shared/stores/globalConfigStore';

import { useState } from 'react';

/**
 * 글로벌 설정 초기화
 * - globalConfig (deviceId, isInApp): 동기 세팅 → children 즉시 렌더링
 * - authStore: 백그라운드로 /api/auth/me 호출, 끝나면 isReady=true
 *
 * children을 블로킹하지 않으므로 흰 화면 깜빡임 없음.
 * auth 상태가 필요한 컴포넌트는 useAuthStore의 isReady를 봐야 함.
 */
export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const initGlobalConfigStore = useGlobalConfigStore(state => state.init);
  const setAuth = useAuthStore(state => state.set);
  const markAuthReady = useAuthStore(state => state.markReady);

  const [configInitialized, setConfigInitialized] = useState(false);

  useOnceEffect(true, () => {
    // 1. globalConfig 동기 세팅 (즉시 children 렌더링 가능)
    const deviceId = getDeviceId();
    const isInApp = Boolean(deviceId);
    initGlobalConfigStore({ isInApp, deviceId });
    setConfigInitialized(true);

    // 2. 웹 유저 인증 상태는 백그라운드로 (TODO: 네이티브 앱 출시 후 재검토)
    if (isInApp) {
      markAuthReady();
      return;
    }

    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setAuth({ isAuthenticated: true, user: data.user });
        } else {
          setAuth({ isAuthenticated: false, user: null });
        }
      })
      .catch(() => {
        setAuth({ isAuthenticated: false, user: null });
      })
      .finally(() => markAuthReady());
  });

  // globalConfig 세팅 전까지만 잠깐 빈 화면 (마이크로초 단위)
  if (!configInitialized) return null;

  return <>{children}</>;
}
