'use client';

import { useGlobalConfigStore } from '@/shared/stores/globalConfigStore';

import { WebNavigation } from './WebNavigation';

export function Header() {
  const isInApp = useGlobalConfigStore(state => state.isInApp);

  if (isInApp) {
    return null;
  }

  return <WebNavigation />;
}
