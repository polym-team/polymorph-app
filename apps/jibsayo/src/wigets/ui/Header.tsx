'use client';

import { useGlobalConfigStore } from '@/shared/stores/globalConfigStore';

import { AppNavigation } from './AppNavigation';
import { WebNavigation } from './WebNavigation';

export function Header() {
  const isInApp = useGlobalConfigStore(state => state.isInApp);

  return isInApp ? <AppNavigation /> : <WebNavigation />;
}
